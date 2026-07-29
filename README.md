# Synapsis

> **Status:** Work in progress / incomplete. The frontend is built and demoable with mock data. The TRIBE v2 GPU backend is implemented but cannot run without a paid Modal account (A100 access). This repo preserves both pieces so development can resume once Modal credits/billing are available.

## What is Synapsis?

**Synapsis** is a tool that predicts whether a short-form video's hook actually catches attention. It runs Meta's [TRIBE v2](https://huggingface.co/facebook/tribev2) brain-encoding model on a serverless A100 GPU via [Modal](https://modal.com/), then turns the raw neural prediction into an engagement score and a visual report.

TRIBE v2 is a multimodal model that predicts cortical responses from video, audio, and text. It combines:

- **V-JEPA2** for video understanding
- **Wav2Vec-BERT 2.0** for audio
- **DINOv2** for vision
- **LLaMA 3.2-3B** for text/language
- **TRIBE's own transformer** architecture

The model outputs a `(time_steps, 20484)` array of predicted cortical vertices at 1Hz. For the UI, those raw values are collapsed into five functional networks and blended into a single engagement curve:

```
Engagement[t] = 0.30·DMN + 0.25·Visual + 0.20·Language + 0.15·Auditory + 0.10·Motion
```

From that curve the app derives:

- **Peak attention** — strongest moment of the hook
- **Sustained attention** — average engagement over time
- **Retention** — how well attention holds to the end
- **Overall score** — weighted composite used to pick a winner

The license for TRIBE v2 is **CC-BY-NC-4.0** (non-commercial), so this project is for learning, research, and experimentation only.

## What is in this repo?

| Directory | Purpose |
|-----------|---------|
| `frontend/` | Next.js + Tailwind + TypeScript + Recharts UI. Landing page, test creation, scoring state, results, and history. Currently uses mock data. |
| `modal-tribe/` | Modal app that runs TRIBE v2 on an A100. Contains image recipe, smoke test, and inference wrapper. |
| `README.md` | This file. |
| `.gitignore` | Root ignore rules for secrets, envs, caches, media, and OS files. |

## Architecture (target)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Frontend   │────▶│   FastAPI    │────▶│ Modal + A100    │────▶│  HuggingFace│
│  (Next.js)  │     │   (backend)  │     │ TRIBE v2        │     │  checkpoints│
└─────────────┘     └──────────────┘     └─────────────────┘     └─────────────┘
                           │                                            │
                           ▼                                            
                    ┌──────────────┐                          ┌─────────────┐
                    │   MongoDB    │                          │  ElevenLabs │
                    │   (tests,    │                          │  / Gemini   │
                    │   variants,  │                          │  (future)   │
                    │   scores)    │                          └─────────────┘
                    └──────────────┘
```

The full stack we planned:

| Layer | Tech | Purpose | Cost |
|-------|------|---------|------|
| Frontend | Next.js + Tailwind + Recharts | Upload variants, show engagement curves, history | Free to host (Vercel) |
| Backend | FastAPI | Orchestrate uploads, call Modal, store results | Free to self-host; Modal has free tier |
| GPU | Modal A100 | Run TRIBE v2 inference | ~$3-4/hr while running; first cold start downloads several GB |
| Auth | Auth0 | User login | Free tier (25k active users) — optional for v1 |
| DB | MongoDB Atlas | Persist tests, variants, scores | Free tier (512MB) |
| AI suggestions | Gemini | Suggest what to test next | Google AI Studio free tier (rate limited) |
| Voice variants | ElevenLabs | Generate alternative voiceovers | Free tier (~10k chars/mo) — optional for v1 |
| Memory/RAG | Backboard.io | Reason over past results | Free tier — optional for v1 |

For a first usable version, the core four are: **Next.js, FastAPI, Modal, MongoDB**. Auth0, ElevenLabs, Gemini, and Backboard are stretch goals.

## Current state

### ✅ Done

- Frontend mock UI built in Next.js with pages for landing, new test, scoring, results, and history.
- Modal app structure in `modal-tribe/` with image, Volume, Secret, and GPU configuration.
- Smoke test script that generates a sample video and calls the Modal function.
- README and `.gitignore` covering both frontend and backend.

### ️ Blocked

- **Modal requires a payment method to run A100 GPU functions.** Running `python test_tribe.py` currently fails with: `Please add a payment method to use A100-40GB GPU functions.`
- The first cold start also downloads several multi-GB encoders, so even with payment you need budget for the initial run.

## Project structure

```
synapsis-uncomplete/
├── README.md              # This file
├── .gitignore             # Root gitignore
├── frontend/              # Next.js frontend (mock data)
│   ├── app/
│   │   ├── page.tsx       # Landing page
│   │   ├── new-test/      # Upload variants
│   │   ├── scoring/       # Loading state
│   │   ├── results/[id]/  # Results detail
│   │   └── history/       # Past tests
│   ├── components/
│   ├── lib/mock-data.ts   # Mock data for demo
│   ├── public/
│   ├── package.json
│   └── ...
└── modal-tribe/           # Modal TRIBE v2 backend
    ├── modal_app.py
    ├── test_tribe.py
    ├── requirements.txt
    ├── README.md
    └── .env.example
```

## Frontend setup

The frontend is a standard Next.js app using pnpm.

```bash
cd frontend
pnpm install   # npm install -g pnpm if you don't have pnpm
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend is fully runnable with mock data and does not need Modal or a GPU. It demonstrates:

- Landing page with clinical/lab-instrument aesthetic
- Multi-variant upload UI
- Scoring/loading state
- Results page with engagement charts
- History table

## Backend setup (when ready)

Prerequisites:

1. Modal account with a payment method or GPU credits.
2. Hugging Face account with a read token.
3. Access to the gated `meta-llama/Llama-3.2-3B` model (accept the license).

```bash
cd modal-tribe
pip install -r requirements.txt
modal setup
modal secret create huggingface-secret HF_TOKEN=hf_YourActualReadToken

# Generate a 10s sample and run inference
python test_tribe.py
```

See [`modal-tribe/README.md`](modal-tribe/README.md) for full details.

## How to continue after A100 access

Once Modal billing is set up:

1. **Run the smoke test**

   ```bash
   cd modal-tribe
   python test_tribe.py
   ```

2. **Verify TRIBE output**
   - You should see a prediction shape like `(10, 20484)`.
   - If it works, the Modal function is healthy.

3. **Build the FastAPI backend**
   - Create `backend/` with a FastAPI app.
   - Add an endpoint like `POST /score` that accepts a video, calls Modal, and returns the prediction.
   - Add the network-reduction math to turn raw vertices into the five networks and the engagement curve.
   - Connect to MongoDB to store tests and results.

4. **Wire the frontend to the backend**
   - Replace mock data with `fetch` calls to FastAPI.
   - Update `frontend/lib/mock-data.ts` or create real data hooks.

5. **Add stretch features**
   - Auth0 for login
   - Gemini for "what to test next" suggestions
   - ElevenLabs for voiceover variants
   - Backboard.io for memory/RAG over past results

## Known limitations / next steps

- The frontend only uses mock data; there is no real backend yet.
- The TRIBE v2 backend cannot run without Modal A100 billing.
- The engagement-score formula above is illustrative; the exact weights should be tuned against real data or copied from a published implementation.
- The text encoder path (`meta-llama/Llama-3.2-3B`) is gated and requires an accepted Hugging Face license.
- First cold start is slow and large; subsequent runs are faster once the Modal Volume cache is warm.

## License and acknowledgments

- TRIBE v2 is released by Meta under CC-BY-NC-4.0 (non-commercial).
- LLaMA 3.2-3B is gated on Hugging Face and has its own license.
- This project is for learning and experimentation.

Acknowledgments:

- Meta AI for [TRIBE v2](https://huggingface.co/facebook/tribev2)
- Modal for serverless GPU infrastructure
- The open-source ML community
