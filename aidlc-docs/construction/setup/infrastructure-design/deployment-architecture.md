# Deployment Architecture — Unit 1: setup

---

## Traffic Flow Diagram

```
         Internet
            |
     :80 (HTTP)  :443 (HTTPS)
            |
     +------+------+
     |    Caddy    |  (caddy:2-alpine, Docker Compose service)
     |  TLS + Proxy|  Let's Encrypt auto-cert
     +------+------+
            |
    portal_net (internal bridge)
            |
     +------+--------+
     |               |
     |  /api/*       |  everything else
     |  /auth/*      |
     |  /health      |
     |               |
+----+----+    +-----+------+
| backend |    | frontend   |
| :3001   |    | nginx :80  |
| Express |    | React SPA  |
+----+----+    +------------+
     |
     | postgres:5432 (internal only)
     |
+----+----+
|  postgres|
| :5432    |
| data vol |
+----------+
     |
postgres_data (named volume)

backend also reads:
../devops-challenges → /data/devops-challenges (read-only bind mount)
```

---

## Port Mapping

| Port | Protocol | Host-exposed | Purpose |
|------|----------|:---:|---------|
| 80 | TCP | Yes | HTTP — Caddy redirects to HTTPS |
| 443 | TCP | Yes | HTTPS — Caddy TLS termination |
| 443 | UDP | Yes | HTTP/3 (QUIC) |
| 3001 | TCP | No | Backend Express API (internal only) |
| 80 | TCP | No | Frontend nginx (internal only) |
| 5432 | TCP | No | PostgreSQL (internal only) |

The database is never reachable from outside the Docker network.

---

## VPS Directory Layout

```
/home/deploy/
├── devops-challenges/           ← git clone of content repo
│   ├── docker/
│   │   ├── 01-build-your-first-container/
│   │   └── ...
│   ├── kubernetes/
│   ├── ci/
│   ├── cd/
│   ├── ansible/
│   ├── iac/
│   ├── observability/
│   └── aws/
└── portal/                      ← git clone of portal repo
    ├── docker-compose.yml
    ├── Caddyfile
    ├── .env                     ← NOT committed, created manually
    ├── .env.example             ← committed, template
    ├── backend/
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   └── schema.prisma
    │   └── src/
    └── frontend/
        ├── Dockerfile
        ├── package.json
        ├── vite.config.ts
        └── src/
```

The bind mount `../devops-challenges:/data/devops-challenges:ro` in `docker-compose.yml` resolves to `/home/deploy/devops-challenges` on the VPS.

---

## First-Deploy Procedure

### 1. Provision VPS

- **OS**: Ubuntu 22.04 LTS (recommended)
- **Specs**: 1–2 vCPU, 2 GB RAM minimum
- **Firewall**: Allow inbound TCP 22 (SSH), 80 (HTTP), 443 (HTTPS); block all others

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
# Docker Compose v2 is included with Docker Engine 23+
docker compose version  # verify
```

### 3. Create Deploy User

```bash
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
```

### 4. Point DNS

Add an A record: `your-domain.com` → VPS public IP address.

Wait for propagation before starting Caddy (Caddy needs HTTP-01 challenge to work).

### 5. Clone Repositories

```bash
su - deploy
git clone https://github.com/<org>/devops-challenges.git
git clone https://github.com/<org>/portal.git
```

### 6. Configure Environment

```bash
cd portal
cp .env.example .env
nano .env  # fill in all values
```

Required values to set:
- `POSTGRES_PASSWORD` — generate with `openssl rand -hex 32`
- `JWT_SECRET` — generate with `openssl rand -hex 32`
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` — from GitHub OAuth App settings
- `FRONTEND_URL=https://your-domain.com`

### 7. Configure Caddyfile

```bash
nano Caddyfile  # replace your-domain.com with actual domain
```

### 8. Start Stack

```bash
docker compose up -d
```

Docker Compose starts services in dependency order:
1. `postgres` starts, health check passes
2. `backend` starts, connects to DB, runs migrations, initialises content index
3. `frontend` builds static SPA
4. `caddy` starts, obtains TLS certificate, begins proxying

### 9. Verify Deployment

```bash
# All 4 containers running
docker compose ps

# Health check passes
curl https://your-domain.com/health
# Expected: { "status": "ok", "db": "connected" }

# Sign-in page visible
open https://your-domain.com
```

---

## Update Procedure

```bash
cd /home/deploy/portal
git pull
docker compose build backend frontend
docker compose up -d
```

Prisma migrations run automatically on backend startup — no manual migration step needed.

To update content only (no code changes):

```bash
cd /home/deploy/devops-challenges
git pull
docker compose restart backend  # backend re-reads filesystem on startup
```

---

## Minimal Backup

```bash
# Dump database to file
docker compose exec postgres \
  pg_dump -U portaluser devops_portal > backup-$(date +%Y%m%d).sql

# Restore (on a new VPS)
docker compose exec -T postgres \
  psql -U portaluser devops_portal < backup-20260225.sql
```

Full backup automation is out of scope (Operations phase).

---

## GitHub OAuth App Configuration

When creating the GitHub OAuth App:

| Field | Value |
|-------|-------|
| Homepage URL | `https://your-domain.com` |
| Authorization callback URL | `https://your-domain.com/auth/github/callback` |

For local development, create a separate OAuth App with callback `http://localhost:3001/auth/github/callback`.
