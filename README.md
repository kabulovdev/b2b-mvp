# B2B Construction Marketplace MVP

This repository contains a minimal full-stack MVP for a B2B construction marketplace.

## Requirements
- Docker + Docker Compose
- Go 1.21+
- Node.js 18+

## Running locally

1) Start PostgreSQL:
```bash
docker-compose up -d
```

2) Backend:
```bash
cd backend
cp .env.example .env
# update DATABASE_URL or DB_* vars if needed
go run ./cmd/api
```

3) Frontend:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and talks to the API at `http://localhost:8080/api` by default.
