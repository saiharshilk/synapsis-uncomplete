# Backend (FastAPI)

This directory is reserved for the FastAPI backend that will orchestrate uploads, call the Modal TRIBE v2 function, and store results in MongoDB.

## Planned responsibilities

- Expose `POST /score` to accept video uploads.
- Call the Modal `TribePredictor.predict_video` function in `modal-tribe/`.
- Reduce raw TRIBE output (~20,484 cortical vertices) into the five functional networks and an engagement curve.
- Persist tests, variants, and scores to MongoDB Atlas.
- (Optional) Integrate Gemini, ElevenLabs, Auth0, and Backboard.io.

## Why it is empty now

The project is currently blocked on Modal A100 GPU access (requires a payment method). Until the TRIBE v2 inference pipeline can run end-to-end, the backend is left as a placeholder. Once the GPU pipeline is verified, the FastAPI app will be added here.
