# modal-tribe: TRIBE v2 on Modal

End-to-end smoke test for running Meta's [TRIBE v2](https://huggingface.co/facebook/tribev2) brain-encoding model on a Modal serverless A100 GPU.

## What this does

- Builds a Modal container image with `tribev2` installed from the official GitHub repo.
- Loads `TribeModel.from_pretrained("facebook/tribev2")` once per container.
- Exposes `TribePredictor.predict_video`, which accepts either raw video bytes or an absolute path to a video file inside the container, runs `model.get_events_dataframe()` and `model.predict()`, and returns the `(n_timesteps, n_vertices)` prediction array plus a few sample values.

## Project layout

| File | Purpose |
|------|---------|
| `modal_app.py` | Modal app: image, Volume, Secret, GPU class, and inference method. |
| `test_tribe.py` | Local script that generates a 10s sample video and calls the Modal function. |
| `requirements.txt` | Local Python deps (mainly `modal`). |
| `.env.example` | Lists the env vars you need without real values. |
| `.gitignore` | Keeps `.env` and caches out of git. |

## Setup

1. **Install the local client dependencies** (a Python 3.9+ venv is fine locally; the Modal container will still use Python 3.11):

   ```bash
   cd /Users/saiharshil/projects/synapsis/modal-tribe
   pip install -r requirements.txt
   ```

2. **Authenticate with Modal** (only needs to be done once):

   ```bash
   modal setup
   ```

   This opens a browser to link your Modal account and stores a token locally.

3. **Create the Modal Secret for your Hugging Face token.**

   Do NOT paste the real token into chat or any repo file. Run this yourself with your actual token:

   ```bash
   modal secret create huggingface-secret HF_TOKEN=hf_YourActualReadToken
   ```

   The app expects a Secret named `huggingface-secret` that exposes the env var `HF_TOKEN`. This is the only place the real token should ever appear.

4. **Make sure your HF account can access the gated text encoder**:
   - Visit https://huggingface.co/meta-llama/Llama-3.2-3B and accept the license if you have not already.

## Run the smoke test

Generate a 10-second sample clip and run it through TRIBE. Both of these do the same thing:

```bash
python test_tribe.py
# or
modal run test_tribe.py
```

You should eventually see something like:

```
TRIBE v2 prediction result:
  shape : (10, 20484)
  dtype : float32
  samples : [[...], [...]]
```

(The exact `n_timesteps` depends on the TR configuration in the model config.)

If the video is already on a Modal Volume, you can also call the function with a path string from another Modal function.

You can also pass an existing video from the Modal CLI:

```bash
modal run modal_app.py --video-path ./some_video.mp4
```

## Modal concepts used

- **Image** (`modal.Image`): a recipe for the container. It installs system libs, Python packages, and environment variables. The image is built once and reused.
- **Secret** (`modal.Secret`): a secure key-value store. The HF token is injected as an runtime env var and never touches source code.
- **Volume** (`modal.Volume`): a persistent network filesystem. We mount it at `/cache` so downloaded model weights and feature caches survive cold starts.
- **GPU** (`gpu="A100"`): tells Modal to run the function on an NVIDIA A100. TRIBE loads three frozen encoders plus its own transformer, so a GPU is required.

## Known gotchas / next-step items

- **First run is slow and large**: downloading V-JEPA2, Wav2Vec-BERT 2.0, DINOv2, LLaMA 3.2-3B, and TRIBE's checkpoint can take several minutes and many gigabytes. The Volume caches them after the first successful run.
- **VRAM**: if you hit out-of-memory errors, switch to `gpu=modal.gpu.A100(size="80GB")` in `modal_app.py`.
- **Audio transcription**: TRIBE's video pipeline runs `uvx whisperx` to transcribe speech. The image pre-installs both `uv` and `whisperx`, but the first transcription still downloads a Whisper model at runtime.
- **File size / return payload**: Modal has a 100 MB default limit for function arguments, and the returned `preds` list grows with video length. This smoke test keeps the clip short so the full array fits. For real videos, write the video to a Volume and return only the path/shape.
- **Format**: the model expects standard video containers (MP4/MOV/etc.) with an audio track. The sample clip generated here satisfies that.
- **Text encoder not exercised by the synthetic clip**: the generated 10s clip has only a sine tone, so WhisperX finds no words and the gated `meta-llama/Llama-3.2-3B` text path is skipped. Video and audio features still run end-to-end; use a spoken clip if you want to verify the full multimodal pipeline.
- **First run may need more than 30 minutes**: if the initial cold start is killed by Modal, raise `timeout=` in `modal_app.py`.
