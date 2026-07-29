"""Modal app that runs Meta's TRIBE v2 brain-encoding model on a serverless A100 GPU.

Usage:
    modal run modal_app.py --video-path ./sample.mp4
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path
import modal

# ---------------------------------------------------------------------------
# Modal primitives
# ---------------------------------------------------------------------------

# A Modal Volume is a persistent network filesystem.  Mounting it at /cache lets
# downloaded HuggingFace weights and TRIBE feature caches survive across cold
# starts, so the next run does not re-download the multi-GB encoders.
tribe_cache = modal.Volume.from_name("tribe-cache", create_if_missing=True)

# A Modal Image describes how to build the container.  We start from a slim
# Debian image with Python 3.11 (TRIBE v2 requires >=3.11), install system
# libraries needed for audio/video decoding, then pip-install the model package
# straight from its GitHub repository.
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git", "libsndfile1", "curl")
    .run_commands(
        # Install the `uv` tool runner. TRIBE's audio pipeline calls `uvx` to
        # execute WhisperX for transcription, so uv/uvx must be on PATH.
        "curl -LsSf https://astral.sh/uv/install.sh | sh",
        "mkdir -p /usr/local/bin",
        "(cp \"$HOME/.local/bin/uv\" /usr/local/bin/uv) || (cp \"$HOME/.cargo/bin/uv\" /usr/local/bin/uv) || true",
        "(cp \"$HOME/.local/bin/uvx\" /usr/local/bin/uvx) || (cp \"$HOME/.cargo/bin/uvx\" /usr/local/bin/uvx) || true",
        "which uv && which uvx && uv --version",
    )
    .pip_install(
        # Pin PyTorch to a version compatible with TRIBE's pyproject.toml
        # (torch>=2.5.1,<2.7) and with the CUDA runtime on Modal's A100.
        "torch==2.5.1",
        "torchvision==0.20.1",
        "torchaudio==2.5.1",
        "hf-transfer",
        "tribev2 @ git+https://github.com/facebookresearch/tribev2.git",
    )
    .run_commands(
        # spaCy model used by TRIBE's text-preprocessing transforms.
        "python -m spacy download en_core_web_sm",
        # Pre-install WhisperX as a uv tool so the first video does not have
        # to download it inside the running container.  Pin torch/torchaudio
        # to the same versions used by TRIBE so the tool environment does not
        # install a conflicting wheel.
        "uv tool install --python python3.11 --with torch==2.5.1 --with torchaudio==2.5.1 whisperx",
    )
    .env(
        {
            # Tell HuggingFace libraries to cache weights inside the Volume.
            "HF_HOME": "/cache/huggingface",
            # Speed up large checkpoint downloads.
            "HF_HUB_ENABLE_HF_TRANSFER": "1",
            # Keep any torch.hub downloads on the Volume as well.
            "TORCH_HOME": "/cache/torch",
            "TORCHHUB_HOME": "/cache/torchhub",
            # WhisperX / Numba caches also live on the Volume.
            "WHISPER_CACHE": "/cache/whisper",
            "NUMBA_CACHE_DIR": "/cache/numba",
            "XDG_CACHE_HOME": "/cache",
        }
    )
)

# A Modal App is the top-level container for functions, images, volumes and
# secrets that belong together.
app = modal.App("tribe-inference", image=image)


# ---------------------------------------------------------------------------
# Inference class
# ---------------------------------------------------------------------------

@app.cls(
    gpu="A100",  # Run on an NVIDIA A100 GPU.
    # The `secrets=` parameter injects named Modal Secrets as environment
    # variables at runtime.  We expect a Secret named "huggingface-secret" that contains
    # the env var HF_TOKEN.
    secrets=[modal.Secret.from_name("huggingface-secret")],
    # Mount the persistent Volume at /cache.  Anything written under /cache is
    # kept across container invocations, so model weights are only downloaded
    # once.
    volumes={"/cache": tribe_cache},
    # First cold start downloads several multi-GB encoders into a fresh Volume.
    # 60 minutes is safer than the default; lower it once the cache is warm.
    timeout=3600,
)
class TribePredictor:
    """Container-lifetime wrapper around TRIBE v2.

    The model is loaded once per container in ``__enter__`` and reused for
    every incoming request.
    """

    @modal.enter()
    def load_model(self) -> None:
        """Authenticate with HuggingFace and load TRIBE v2."""
        from huggingface_hub import login as hf_login
        from tribev2 import TribeModel

        # Ensure cache directories exist on the mounted Volume.
        Path("/cache/huggingface").mkdir(parents=True, exist_ok=True)
        Path("/cache/tribe_features").mkdir(parents=True, exist_ok=True)
        Path("/tmp/tribe_input").mkdir(parents=True, exist_ok=True)

        # The Modal Secret injects HF_TOKEN into the environment.
        hf_token = os.environ.get("HF_TOKEN")
        if not hf_token:
            raise RuntimeError(
                "HF_TOKEN is not set. Create a Modal Secret with:\n"
                "  modal secret create huggingface-secret HF_TOKEN=hf_..."
            )
        hf_login(token=hf_token)

        print("Loading TRIBE v2 model...")
        self.model = TribeModel.from_pretrained(
            "facebook/tribev2",
            cache_folder="/cache/tribe_features",
            device="auto",
        )
        print("TRIBE v2 loaded.")

    def _run_prediction(self, video_path: Path) -> dict:
        """Shared helper that runs TRIBE on a local file path."""
        print(f"Building events dataframe for {video_path}")
        events = self.model.get_events_dataframe(video_path=str(video_path))

        # verbose=False keeps tqdm from spamming Modal logs.
        preds, _segments = self.model.predict(events, verbose=False)

        # For long videos, serializing the whole array can exceed Modal's
        # payload limits.  This helper is intended for short smoke-test clips;
        # for production-length videos, write the output to a Volume and
        # return the path instead.
        return {
            "shape": preds.shape,
            "dtype": str(preds.dtype),
            "preds": preds.tolist(),
        }

    @modal.method()
    def predict_video(self, video) -> dict:
        """Run TRIBE v2 on a raw MP4 video.

        Parameters
        ----------
        video:
            Either raw bytes of a video file or an absolute path to a video
            file that is visible inside the container (e.g., on a mounted
            Volume).

        Returns
        -------
        dict
            JSON-serializable result with keys ``shape``, ``dtype``, and
            ``preds`` (the full prediction array as a nested list).
        """
        if isinstance(video, str):
            return self._run_prediction(Path(video))

        # Save the uploaded bytes to a temporary file that TRIBE can read.
        with tempfile.NamedTemporaryFile(
            suffix=".mp4", delete=False, dir="/tmp/tribe_input"
        ) as f:
            f.write(video)
            video_path = Path(f.name)

        try:
            return self._run_prediction(video_path)
        finally:
            try:
                video_path.unlink(missing_ok=True)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# Local entrypoint (useful for a quick smoke test from the Modal CLI)
# ---------------------------------------------------------------------------

@app.local_entrypoint()
def main(video_path: str) -> None:
    """Upload a local video to the Modal function and print the result.

    Example:
        modal run modal_app.py --video-path ./sample.mp4
    """
    video_bytes = Path(video_path).read_bytes()
    result = TribePredictor.predict_video.remote(video_bytes)
    preds = result["preds"]
    print(f"shape: {result['shape']}, dtype: {result['dtype']}")
    print(f"sample values (first 2x5): {[row[:5] for row in preds[:2]]}")
