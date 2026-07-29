# synapsis-uncomplete

> **Status:** Incomplete — this repository contains a work-in-progress implementation. It was not completed due to payment/credit limitations with the cloud GPU provider (Modal). The code, documentation, and smoke tests are preserved here as a starting point for anyone who wants to continue the project.

## What is this?

**synapsis-uncomplete** is a project to run Meta's [TRIBE v2](https://huggingface.co/facebook/tribev2) brain-encoding model on a serverless A100 GPU using [Modal](https://modal.com/).

TRIBE v2 is a multimodal model that predicts neural responses from video, audio, and (optionally) text. It combines:

- V-JEPA2 for video understanding
- Wav2Vec-BERT 2.0 for audio
- DINOv2 for vision
- LLaMA 3.2-3B for text/language
- TRIBE's own transformer architecture

## What's in this repo?

The `modal-tribe/` directory contains the full implementation:

| File | Purpose |
|------|---------|
| `modal_app.py` | Modal app definition: container image, Volume, Secret, GPU class, and inference method. |
| `test_tribe.py` | Local script that generates a 10s sample video and calls the Modal function. |
| `requirements.txt` | Local Python dependencies (mainly `modal`). |
| `README.md` | Detailed setup and usage instructions for the Modal app. |

## Why is it uncompleted?

The implementation reached a working smoke-test stage locally, but could not be fully deployed/run because:

1. **Modal requires a payment method / credits** to run GPU workloads.
2. The **first cold start downloads several multi-GB encoders** (V-JEPA2, Wav2Vec-BERT 2.0, DINOv2, LLaMA 3.2-3B, and TRIBE checkpoints), which exceeds a free-tier budget.
3. Running on an **NVIDIA A100** is required for TRIBE v2, which is not free on Modal.

All code, configuration, and documentation are preserved so the project can be resumed once funding/credits are available.

## What was working?

- ✅ Modal app structure with image, Secret, Volume, and GPU configuration
- ✅ Local sample video generation via `ffmpeg`
- ✅ `TribePredictor` class that loads `TribeModel.from_pretrained("facebook/tribev2")`
- ✅ Inference pipeline: `get_events_dataframe()` → `predict()` → return predictions
- ✅ Local entrypoint to upload a video file and print results

## What is needed to continue?

To finish this project, you will need:

1. A Modal account with a valid payment method or GPU credits.
2. A Hugging Face account with a read token.
3. Access to the gated `meta-llama/Llama-3.2-3B` model (accept the license on Hugging Face).
4. Sufficient Modal spend budget to cover the first large cold start (~several GB of downloads + A100 time).

## Quick start (if you have Modal + HF credentials)

```bash
cd modal-tribe
pip install -r requirements.txt
modal setup
modal secret create huggingface-secret HF_TOKEN=hf_YourActualReadToken

# Generate a 10s sample and run inference
python test_tribe.py
```

> **Note:** The Modal container uses Python 3.11 (TRIBE v2 requires `>=3.11`), while your local client can run Python 3.9+. See `.env.example` for the environment variables the app expects.

See [`modal-tribe/README.md`](modal-tribe/README.md) for full details.

## Project structure

```
synapsis-uncomplete/
├── README.md                 # This file
└── modal-tribe/
    ├── README.md             # Detailed Modal setup/run guide
    ├── modal_app.py          # Modal GPU app
    ├── test_tribe.py         # Smoke test script
    ├── requirements.txt      # Local Python deps
    └── .gitignore            # Ignores .env and caches
```

## License

This repository contains code that interfaces with Meta's TRIBE v2. Please respect the licenses of TRIBE v2, LLaMA 3.2, and any other third-party models or libraries used.

## Acknowledgments

- Meta AI for [TRIBE v2](https://huggingface.co/facebook/tribev2)
- Modal for serverless GPU infrastructure
- The open-source ML community
