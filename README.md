# Travel Platform AWS

A full-stack travel discovery and trip-planning application deployed with a
serverless AWS backend and a Next.js frontend.

## Live Demo

- Application: https://travel.thatcherdev.id.vn
- Places catalog: https://travel.thatcherdev.id.vn/places
- API health: https://riykkqhge2.execute-api.ap-southeast-2.amazonaws.com/health

## Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS, React Query
- Backend: Node.js 20, Express, TypeScript, Prisma
- AWS: Lambda, API Gateway, RDS PostgreSQL, S3, CloudWatch
- Hosting: Vercel with a custom domain
- Data: OpenStreetMap-derived demo catalog

## Repository Layout

```text
backend/   Express API, Prisma schema, migrations, and data importers
frontend/  Next.js application
```

Generated builds, Lambda packages, dependency layers, local environment files,
logs, screenshots, and workshop artifacts are intentionally excluded from Git.

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

The backend requires PostgreSQL. Redis is optional; when `REDIS_URL` is not set,
the application uses an in-memory cache fallback.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the backend URL ending in `/api`.

## Production Builds

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

## Demo Data

The repository includes a normalized OpenStreetMap dataset and repeatable import
scripts:

- `backend/fetch-openstreetmap-data.js`
- `backend/prepare-demo-data.js`
- `backend/import-open-data.js`
- `backend/osm-places.json`

Imported places use stable source IDs so rerunning the importer updates existing
records instead of creating duplicates.

## Environment Variables

Use the committed `.env.example` files as templates. Never commit real database
passwords, AWS credentials, JWT secrets, or Vercel configuration.
