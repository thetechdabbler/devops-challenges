# 07 — Networking Between Containers

**Level**: Intermediate | **Topic**: Docker

Wire up a Flask app, Redis cache, and Postgres database using Docker Compose custom networks. Five issues to fix.

## Quick Start

```bash
cd starter
docker compose up -d
curl http://localhost:5000/cache-check
curl http://localhost:5000/db-check
docker network ls
```

See [`challenge.md`](./challenge.md) for the full list of problems to fix.

## Solution

[`solutions/docker/07-networking-between-containers/`](../../../solutions/docker/07-networking-between-containers/)
