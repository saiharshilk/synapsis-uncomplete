"""Generate a short sample video and run it through TRIBE v2 on Modal.

This script:
1. Creates a 10-second 640x480 test clip with synthetic audio using ffmpeg.
2. Uploads the clip to the Modal ``TribePredictor`` class defined in
   ``modal_app.py``.
3. Prints the shape of the returned predictions and a few sample values.

Run with:
    python test_tribe.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from modal_app import TribePredictor, app


SAMPLE_PATH = Path(__file__).with_name("sample.mp4")
SAMPLE_DURATION = 10  # seconds


def generate_sample_video(path: Path, duration: int = SAMPLE_DURATION) -> Path:
    """Create a short MP4 clip with a moving test pattern and a sine-wave tone."""
    path.parent.mkdir(parents=True, exist_ok=True)

    # lavfi testsrc: moving color bars; sine audio: simple tone so TRIBE has an
    # audio track to process.
    cmd = [
        "ffmpeg",
        "-y",
        "-f", "lavfi",
        "-i", f"testsrc=size=640x480:rate=30:duration={duration}",
        "-f", "lavfi",
        "-i", f"sine=frequency=1000:duration={duration}",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        str(path),
    ]

    print(f"Generating {duration}s sample video with ffmpeg...")
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Wrote sample video to {path} ({path.stat().st_size} bytes)")
    return path


def _run_smoke_test() -> None:
    """Shared logic used by both `python test_tribe.py` and `modal run test_tribe.py`."""
    if not SAMPLE_PATH.exists():
        generate_sample_video(SAMPLE_PATH)
    else:
        print(f"Using existing sample video: {SAMPLE_PATH}")

    video_bytes = SAMPLE_PATH.read_bytes()
    print(f"Uploading {len(video_bytes)} bytes to Modal...")

    result = TribePredictor.predict_video.remote(video_bytes)

    preds = result["preds"]
    n_timesteps = len(preds)
    n_vertices = len(preds[0]) if preds else 0

    print("\nTRIBE v2 prediction result:")
    print(f"  shape : ({n_timesteps}, {n_vertices})")
    print(f"  dtype : {result['dtype']}")
    print(f"  total values returned: {n_timesteps} timesteps x {n_vertices} vertices")
    print(f"  sample values (first 2 timesteps x first 5 vertices): {[row[:5] for row in preds[:2]]}")


@app.local_entrypoint()
def smoke_test() -> None:
    """Entrypoint for ``modal run test_tribe.py``."""
    _run_smoke_test()


def main() -> None:
    """Entrypoint for ``python test_tribe.py``."""
    with app.run():
        _run_smoke_test()


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as exc:
        print(f"\nRequired command not found: {exc}")
        print("Make sure ffmpeg is installed on this local machine.")
        sys.exit(1)
    except Exception as exc:
        message = str(exc).lower()
        if "auth" in message or "token" in message or "credential" in message:
            print(
                "\nModal or Hugging Face authentication failed.\n"
                "Run `modal setup` and create the secret with:\n"
                "  modal secret create huggingface-secret HF_TOKEN=hf_..."
            )
        raise
