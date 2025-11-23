# Hollowmarch starter

This repository provides a baseline architecture for an OSRS-inspired browser game using a Vite/React/TypeScript frontend, a .NET minimal API backend, PostgreSQL for persistence, REST endpoints, and WebSocket live updates.

## Stack overview
- **frontend/**: Vite + React + TypeScript UI with React Query for data fetching.
- **backend/**: .NET 8 minimal API exposing REST routes under `/api` and a WebSocket endpoint at `/ws/game`.
- **PostgreSQL**: Primary data store with starter EF Core entities for player sessions and world messages.
- **Docker Compose**: `docker-compose.yml` orchestrates the database, backend, and frontend containers.

## Running locally
1. Ensure Docker is installed and running.
2. From the repo root, start the stack:
   ```bash
   docker compose up --build
   ```
3. Visit the frontend at <http://localhost:5173>. The frontend proxies API calls to the backend and connects to the WebSocket endpoint.
4. Swagger UI for the backend is available at <http://localhost:5041/swagger> in development mode.

## Environment variables
- `ConnectionStrings__Database`: override the backend connection string (defaults point to the compose `db` service).
- `VITE_API_URL`, `VITE_WS_URL`: configure the frontend to target a different API/WebSocket host.

## Next steps
- Add real game domain entities (combat, inventory, skills) and migrations to materialize the schema.
- Implement authentication/session security and rate limiting.
- Push live game events from server systems into `GameEventService` for players online.
- Harden WebSocket lifecycle handling and validation before moving to production.
