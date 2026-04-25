
# Dating App Demo

This project is a Vite + React frontend generated from a Figma Make prototype and refactored into a scalable folder structure for production-oriented development.

The original design source is available at [Figma](https://www.figma.com/design/BmbQzwKX7e3zd2QoG9MgCb/dating-app-demo--Copy-).

## Tech Stack

- Vite
- React + TypeScript
- Tailwind CSS
- React Router

## Folder Structure

```txt
src/
  app/         # App shell and route registration
  components/  # Reusable UI components
  layouts/     # Shared page layouts
  pages/       # Route-level screens
  lib/         # Route constants, mock data, API abstraction
  styles/      # Tailwind and global styles
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start local development:

```bash
npm run dev
```

3. Create production build:

```bash
npm run build
```

## Backend Integration

This frontend is ready to work with a backend via the API layer in `src/lib/api`.

### Configure base URL

Create a `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

If `VITE_API_BASE_URL` is not set (or the API is unavailable), match data gracefully falls back to local mock data so the UI still works in development.

### API modules

- `src/lib/api/client.ts` - shared request helper, timeout handling, typed API errors
- `src/lib/api/match-api.ts` - `GET /matches/today` with automatic fallback to mock
- `src/lib/api/auth-api.ts` - auth request wrappers (`/auth/login`, `/auth/signup`)
- `src/lib/api/chat-api.ts` - chat request wrappers (`/matches/:id/messages`)

### Why this scales

- UI components are not tightly coupled to raw `fetch` calls.
- API contracts are centralized, so backend endpoint changes only require updates in `src/lib/api`.
- Mock fallback keeps product development unblocked while backend endpoints are still evolving.
  