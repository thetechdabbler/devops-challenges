# 06 — Health Checks and Restart Policies

**Level**: Intermediate | **Topic**: Docker

Add HEALTHCHECK and restart policies to a Flask app so Docker can detect a broken container and recover automatically. Four issues to fix.

## Quick Start

```bash
cp ../../../../shared-resources/app/app.py starter/
cp ../../../../shared-resources/app/requirements.txt starter/
cd starter
docker compose up -d
docker compose ps          # watch for (healthy) status
docker inspect devops-app --format='{{.State.Health.Status}}'
```

See [`challenge.md`](./challenge.md) for the full list of problems to fix.

## Solution

[`solutions/docker/06-health-checks-and-restart-policies/`](../../../solutions/docker/06-health-checks-and-restart-policies/)
