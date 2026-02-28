# Infrastructure Design Plan — Unit 1: setup

## Unit Context

Unit 1 defines the entire stack's deployment shape: Docker Compose services, networking, volumes, and how external traffic reaches the app. Most infrastructure choices are already decided (Docker Compose, PostgreSQL 16, Node 20, nginx for frontend, VPS). Two open questions remain.

---

## Questions

---

### Q1: Reverse Proxy / TLS Strategy

The Express backend serves HTTP internally. External users need HTTPS. What handles TLS termination and traffic routing on the VPS?

A) **Caddy** — runs on the host (or as a Docker service), auto-obtains Let's Encrypt certificates, proxies `api.domain.com` → backend and `domain.com` → frontend. Minimal config, fully automatic HTTPS.

B) **Traefik** — runs as a Docker Compose service, auto-detects other containers via labels, handles Let's Encrypt. More config than Caddy but stays entirely within Docker Compose.

C) **nginx on host** — manually configured nginx on the VPS as a reverse proxy; TLS via Certbot + Let's Encrypt cron. Most manual, most control.

D) **No reverse proxy yet** — expose Docker ports directly on the VPS for now (HTTP only), add TLS later when deploying to production.

[Answer]: A — Caddy as a Docker Compose service (5th service in docker-compose.yml)

---

### Q2: Content Volume Mount Strategy

The backend container needs read access to `devops-challenges/` at runtime. Where does this directory live relative to the Docker Compose setup, and how is it mounted?

A) **Sibling directory** — `devops-challenges/` lives alongside `portal/` in the workspace root. Mounted as a read-only bind mount: `../devops-challenges:/data/devops-challenges:ro`

B) **Copied into image at build time** — `devops-challenges/` is `COPY`-ed into the backend Docker image during build. No runtime mount needed; restart to pick up content changes.

C) **Separate volume** — `devops-challenges/` is managed as a named Docker volume, populated via a setup script.

[Answer]: A — Bind mount from sibling directory (read-only)

---

## Artifact Generation Steps

- [x] Create `aidlc-docs/construction/setup/infrastructure-design/infrastructure-design.md`
  - Service definitions (backend, frontend, postgres, caddy)
  - Volume and network configuration
  - Environment variable wiring
  - Caddyfile path-based routing
- [x] Create `aidlc-docs/construction/setup/infrastructure-design/deployment-architecture.md`
  - Full stack diagram (traffic flow from internet to DB)
  - Port mapping and exposure
  - VPS directory layout
  - First-deploy and update procedures
