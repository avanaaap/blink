# Blink

LA Hacks 2026 — A mobile dating app.

## Tech Stack

| Layer              | Technology                    |
| ------------------ | ----------------------------- |
| Frontend           | Vite + React + TypeScript     |
| Backend            | Python + FastAPI              |
| Database / Auth    | Supabase                      |
| Identity Verification | World ID (IDKit, off-chain) |

## Project Structure

```
blink/
├── frontend/           # Vite React app
│   ├── src/
│   │   ├── assets/     # Static assets (images, fonts, etc.)
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Client setup (Supabase, World ID, etc.)
│   │   ├── pages/      # Route-level page components
│   │   ├── router.tsx  # React Router config
│   │   ├── App.tsx     # Root layout component
│   │   └── main.tsx    # Entry point
│   └── .env.example
├── backend/            # FastAPI server
│   ├── app/
│   │   ├── core/       # Config, Supabase client, shared utilities
│   │   ├── models/     # Pydantic / DB models
│   │   ├── routers/    # API route handlers
│   │   ├── services/   # Business logic
│   │   └── main.py     # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
├── Makefile
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.11
- A [Supabase](https://supabase.com) project (for database & auth)
- A [World ID](https://worldcoin.org/world-id) app (for identity verification)

### 1. Clone the repo

```bash
git clone https://github.com/avanaaap/blink.git
cd blink
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # fill in your Supabase & World ID keys
npm install
npm run dev            # starts Vite dev server on http://localhost:5173
```

### 3. Backend

```bash
cd backend
cp .env.example .env   # fill in your Supabase & World ID keys
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

### Using the Makefile

```bash
make install          # install both frontend & backend deps
make dev-frontend     # start frontend dev server
make dev-backend      # start backend dev server
```

## Environment Variables

See `frontend/.env.example` and `backend/.env.example` for the full list.
