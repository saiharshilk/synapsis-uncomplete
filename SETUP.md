# Synapsis — Setup & Run Guide

This guide gets you from a fresh clone to a running frontend and (optionally) a running TRIBE v2 backend.

## What you need

- **Git** — to clone the repo
- **Node.js 18+** and **pnpm** — for the frontend
- **Python 3.9+** — for the local Modal *client* scripts (the Modal container itself uses Python 3.11 because TRIBE v2 requires `>=3.11`)
- **ffmpeg** — only needed for the GPU smoke test (it generates a sample video)
- **Modal account** — only needed for the GPU backend
- **Hugging Face account + read token** — only needed for the GPU backend
- **Payment method on Modal** — only needed for the A100 GPU backend (Modal requires it for A100 access)

> **Note:** The frontend runs completely offline with mock data. You only need Modal/Hugging Face if you want to run real TRIBE v2 inference.

---

## 1. Clone the repo

```bash
git clone https://github.com/saiharshilk/synapsis-uncomplete.git
cd synapsis-uncomplete
```

---

## 2. Run the frontend (mock UI)

The frontend is a Next.js app in `frontend/`. It uses mock data and does not need a GPU or Modal.

```bash
cd frontend

# Install dependencies
# pnpm may ask to approve native builds for sharp/msw; for the mock UI you can skip them.
pnpm install --ignore-scripts

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production (good sanity check that the static export works):

```bash
pnpm build
```

### Common frontend issues

| Issue | Fix |
|-------|-----|
| `pnpm: command not found` | Install pnpm: `npm install -g pnpm` |
| `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: sharp` | Use `pnpm install --ignore-scripts` for the mock UI |
| Next.js infers the wrong workspace root | Already handled in `frontend/next.config.mjs` via `turbopack.root` |

---

## 3. Set up the TRIBE v2 backend (when ready)

The Modal backend lives in `modal-tribe/`. You only need this when you want to run real TRIBE v2 inference on an A100.

### 3.1 Install local Python dependencies

```bash
cd modal-tribe
pip install -r requirements.txt
```

### 3.2 Request access and accept the gated LLaMA license on Hugging Face

Before running TRIBE v2, you must *request access to* and *accept the license for* the gated text encoder:

https://huggingface.co/meta-llama/Llama-3.2-3B

Approval is usually automatic but may take a few minutes. Once approved, generate a Hugging Face read token so `TribeModel.from_pretrained` can download the model.

### 3.3 Authenticate with Modal

```bash
modal setup
```

This opens a browser to link your Modal account.

### 3.4 Create the Hugging Face token secret

Do NOT paste your real token into any repo file. Run this with your actual read token:

```bash
modal secret create huggingface-secret HF_TOKEN=hf_YourActualReadToken
```

Make sure your Hugging Face account has accepted the license for `meta-llama/Llama-3.2-3B`.

### 3.5 Run the smoke test

```bash
python test_tribe.py
```

Expected output looks like:

```
TRIBE v2 prediction result:
  shape : (10, 20484)
  dtype : float32
  ...
```

If this is your first run, the cold start will download several multi-GB encoders into the Modal Volume. This can take 10–30 minutes and requires an A100.

### Common backend issues

| Issue | Fix |
|-------|-----|
| `Please add a payment method to use A100-40GB GPU functions` | Modal requires a payment method for A100. Add one in Modal settings. You still get $30/month in free credits. |
| `HF_TOKEN is not set` | Create the Modal Secret with your Hugging Face read token (step 3.3). |
| Out of memory errors | Switch to `gpu=modal.gpu.A100(size="80GB")` in `modal_app.py`. |
| First run is killed / times out | Raise the `timeout=` value in `modal_app.py` (default is 3600 seconds). |

---

## 4. Project structure reminder

```
synapsis-uncomplete/
├── frontend/          # Next.js mock UI
├── modal-tribe/       # Modal + TRIBE v2 GPU backend
├── backend/           # Placeholder for future FastAPI backend
├── README.md          # Full project overview
└── SETUP.md           # This file
```

---

## 5. Next steps after the backend works

1. **Build a FastAPI backend** in `backend/` that accepts video uploads, calls the Modal function, and returns predictions.
2. **Reduce the raw TRIBE output** (~20,484 cortical vertices) into the five functional networks and an engagement curve.
3. **Wire the frontend** to the FastAPI backend instead of mock data.
4. **Persist results** to MongoDB Atlas.
5. **Add optional integrations** (Auth0, Gemini, ElevenLabs, Backboard.io).

---

## 6. What is gitignored (not in the repo)

If you delete your local folder and re-clone, you will need to recreate these locally:

- `.env` — any secrets/tokens
- `frontend/node_modules/` and `frontend/.next/` — reinstall with `pnpm install`
- `frontend/next-env.d.ts` and `frontend/pnpm-workspace.yaml` — auto-generated during builds, already ignored
- `modal-tribe/venv/` — recreate with `python -m venv venv`
- Any generated sample videos (e.g., `modal-tribe/sample.mp4`)
- Modal/Hugging Face caches (model weights, feature caches)

Keep your `.env` and secrets backed up somewhere safe.
