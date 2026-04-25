.PHONY: install-frontend install-backend install dev-frontend dev-backend dev

# ── Install ──────────────────────────────────────────────────────────────────

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

install: install-frontend install-backend

# ── Dev servers ──────────────────────────────────────────────────────────────

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

dev:
	@echo "Run 'make dev-frontend' and 'make dev-backend' in separate terminals."

# ── Build / Lint ─────────────────────────────────────────────────────────────

build-frontend:
	cd frontend && npm run build

lint-frontend:
	cd frontend && npm run lint
