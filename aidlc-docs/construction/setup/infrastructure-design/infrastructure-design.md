# Infrastructure Design — Unit 1: setup

---

## Docker Compose Services

Four services defined in `portal/docker-compose.yml`. Caddy runs as a 5th compose service — no host-level installation required.

| Service | Image | Role |
|---------|-------|------|
| `postgres` | `postgres:16-alpine` | PostgreSQL database |
| `backend` | Custom `node:20-alpine` | Express REST API |
| `frontend` | Custom `nginx:alpine` | Static React SPA |
| `caddy` | `caddy:2-alpine` | Reverse proxy + automatic TLS |

---

## Service Definitions

### `postgres`

```yaml
postgres:
  image: postgres:16-alpine
  restart: unless-stopped
  environment:
    POSTGRES_DB: devops_portal
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - portal_net
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d devops_portal"]
    interval: 5s
    timeout: 5s
    retries: 10
```

No ports exposed to host — only reachable within `portal_net` by service name `postgres:5432`.

---

### `backend`

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  restart: unless-stopped
  env_file: .env
  environment:
    DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/devops_portal?connection_limit=5"
    CONTENT_PATH: /data/devops-challenges
    PORT: "3001"
  volumes:
    - ../devops-challenges:/data/devops-challenges:ro
  networks:
    - portal_net
  depends_on:
    postgres:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s
```

Key points:
- `depends_on: postgres: condition: service_healthy` — waits for `pg_isready` before starting (complements the app-level retry in BR-03)
- `../devops-challenges` resolves relative to the location of `docker-compose.yml` (i.e., `portal/`)
- No port exposed to host — only reachable within `portal_net` by Caddy as `backend:3001`

---

### `frontend`

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      VITE_API_BASE_URL: ""
  restart: unless-stopped
  networks:
    - portal_net
```

`VITE_API_BASE_URL` is empty — in production, API calls go to the same origin (`/api/*`) and Caddy routes them to the backend. No CORS needed in production.

No port exposed to host — only reachable within `portal_net` by Caddy as `frontend:80`.

---

### `caddy`

```yaml
caddy:
  image: caddy:2-alpine
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
    - "443:443/udp"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile:ro
    - caddy_data:/data
    - caddy_config:/config
  networks:
    - portal_net
  depends_on:
    - backend
    - frontend
```

Only service with host-exposed ports. Handles HTTP→HTTPS redirect (port 80) and HTTPS termination (port 443). UDP 443 enables HTTP/3 (QUIC).

---

## Volumes

```yaml
volumes:
  postgres_data:    # PostgreSQL data persistence — survives container restart
  caddy_data:       # Let's Encrypt certificate storage — survives container restart
  caddy_config:     # Caddy internal config cache
```

`devops-challenges/` is a **bind mount** (not a named volume) — it is a read-only view of the git-cloned repository on the VPS filesystem. Updates to content are picked up on server restart without rebuilding images.

---

## Networks

```yaml
networks:
  portal_net:
    driver: bridge
```

Single internal bridge network. Service-to-service communication uses Docker DNS (e.g., `postgres:5432`, `backend:3001`, `frontend:80`). No service is reachable from outside Docker except through Caddy's exposed ports.

---

## Caddyfile

Path-based routing on a single domain — one certificate, no subdomains required:

```
your-domain.com {
    # Backend routes
    handle /api/* {
        reverse_proxy backend:3001
    }
    handle /auth/* {
        reverse_proxy backend:3001
    }
    handle /health {
        reverse_proxy backend:3001
    }
    # Everything else → React SPA
    handle {
        reverse_proxy frontend:80
    }
}
```

Caddy automatically:
1. Redirects HTTP → HTTPS
2. Obtains a Let's Encrypt TLS certificate for the domain on first startup
3. Renews certificates before expiry

Replace `your-domain.com` with the actual domain when deploying. DNS A record must point to the VPS IP before starting Caddy (required for the ACME HTTP-01 challenge).

---

## Environment Variables

Single `.env` file at `portal/` (adjacent to `docker-compose.yml`):

```bash
# PostgreSQL credentials
POSTGRES_USER=portaluser
POSTGRES_PASSWORD=<strong-random-password>

# JWT signing
JWT_SECRET=<64-char-random-hex-string>

# GitHub OAuth app credentials
GITHUB_CLIENT_ID=<from-github-oauth-app-settings>
GITHUB_CLIENT_SECRET=<from-github-oauth-app-settings>

# App config
FRONTEND_URL=https://your-domain.com
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
```

`DATABASE_URL` is constructed inline in `docker-compose.yml` using `POSTGRES_USER` and `POSTGRES_PASSWORD` — not repeated in `.env`. This avoids credential duplication.

`.env` is listed in `.gitignore` — never committed. `.env.example` (with placeholder values) is committed.

---

## Local Development Mode

Docker Compose is **not** used for local development. Developers run services directly:

```bash
# Terminal 1 — PostgreSQL (Docker only for DB)
docker run -e POSTGRES_DB=devops_portal -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 postgres:16-alpine

# Terminal 2 — Backend
cd portal/backend && npm run dev   # ts-node-dev or nodemon

# Terminal 3 — Frontend
cd portal/frontend && npm run dev  # Vite dev server on :5173
```

For local dev, `FRONTEND_URL=http://localhost:5173` and the Vite dev server proxies `/api/*` to `localhost:3001` (configured in `vite.config.ts`).
