# Backend API

## Setup
```bash
cp .env.example .env
```

## Run
```bash
go run ./cmd/api
```

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/me
- POST /api/buyer/rfqs
- GET /api/buyer/rfqs
- GET /api/buyer/rfqs/:id/offers
- POST /api/buyer/offers/:offerId/accept
- POST /api/supplier/products
- GET /api/supplier/products
- GET /api/supplier/rfqs
- POST /api/supplier/offers
