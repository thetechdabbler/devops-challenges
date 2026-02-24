# 05 — Environment Variables and Secrets

**Level**: Intermediate | **Topic**: Docker

Remove hardcoded credentials from a Flask app and replace them with environment variables and Docker secrets. Five issues to fix, one secure compose stack to produce.

## Quick Start

```bash
cp ../../../../shared-resources/app/app.py starter/
cp ../../../../shared-resources/app/requirements.txt starter/
cd starter
# Read challenge.md, then fix app.py, docker-compose.yml, and create .env / .dockerignore
docker compose up
curl http://localhost:5000/config
```

See [`challenge.md`](./challenge.md) for the full list of problems to fix.

## Solution

[`solutions/docker/05-environment-variables-and-secrets/`](../../../solutions/docker/05-environment-variables-and-secrets/)
