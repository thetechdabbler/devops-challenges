# DevOps Practice Portal

A full-stack web application for working through the `devops-challenges` exercises with progress tracking, timed sessions, and notes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| State | Zustand |
| Notes editor | CodeMirror 6 |
| Backend | Node.js 20 + Express + TypeScript |
| Database | PostgreSQL 16 via Prisma ORM |
| Auth | GitHub OAuth + JWT (httpOnly cookies) |
| Reverse proxy | Caddy (auto TLS) |
| Deployment | Docker Compose on self-hosted VPS |

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- A GitHub OAuth App ([create one](https://github.com/settings/developers))

### Setup

```bash
# 1. Clone both repos side by side
git clone https://github.com/<org>/devops-challenges.git
git clone https://github.com/<org>/portal.git

# 2. Configure environment
cd portal
cp .env.example .env
# Edit .env — set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET
# FRONTEND_URL=http://localhost:5173
# NODE_ENV=development

# 3. Start PostgreSQL
docker run -d \
  -e POSTGRES_DB=devops_portal \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Install backend dependencies and run migrations
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate

# 5. Start backend dev server
npm run dev      # http://localhost:3001

# 6. In a new terminal — install and start frontend
cd ../frontend
npm install
npm run dev      # http://localhost:5173
```

### GitHub OAuth App (local dev)

Create a separate OAuth App for local development:
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:3001/auth/github/callback`

---

## Running Tests

```bash
cd backend
npm test
```

---

## Production Deployment

See `aidlc-docs/construction/setup/infrastructure-design/deployment-architecture.md` for the full first-deploy procedure.

Quick summary:
```bash
# On VPS (both repos cloned to /home/deploy/)
cd /home/deploy/portal
cp .env.example .env
nano .env          # fill in production values
nano Caddyfile     # replace your-domain.com with actual domain
docker compose up -d
```

### Updating

```bash
cd /home/deploy/portal
git pull
docker compose build backend frontend
docker compose up -d
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_USER` | Yes | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password |
| `JWT_SECRET` | Yes | JWT signing secret (64-char hex) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `FRONTEND_URL` | Yes | Allowed CORS origin (`https://your-domain.com` or `http://localhost:5173`) |
| `PORT` | Yes | Backend HTTP port (default: `3001`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `LOG_LEVEL` | Yes | `debug`, `info`, `warn`, or `error` |

---

## Project Structure

```
portal/
├── docker-compose.yml
├── Caddyfile
├── .env.example
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── index.ts             Entry point
│       ├── lib/                 Shared utilities
│       ├── controllers/         Route handlers
│       ├── services/            Business logic
│       ├── repositories/        Database access
│       ├── middleware/          Express middleware
│       └── routes/              Route definitions
└── frontend/
    └── src/
        ├── api/                 API client
        ├── stores/              Zustand stores
        ├── components/          Shared components
        └── pages/               Page components
```
