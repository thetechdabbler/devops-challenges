# Solution — Health Checks and Restart Policies

## The Fixed Files

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["python", "app.py"]
```

**docker-compose.yml:**
```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
    restart: unless-stopped

  worker:
    image: busybox
    command: sh -c "echo 'worker started' && sleep infinity"
    depends_on:
      app:
        condition: service_healthy
    restart: unless-stopped
```

---

## Fixes Applied

### Fix 1: HEALTHCHECK instruction

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
```

- `curl -f` returns exit code 22 on HTTP 4xx/5xx, making the health check fail correctly.
- `--start-period=10s` gives the Flask app time to start before Docker counts failures. Without this, a slow startup can cause unnecessary restarts.
- After 3 consecutive failures, the container is marked `unhealthy`. Orchestrators (Swarm, ECS, Kubernetes) use this to stop routing traffic.

### Fix 2: restart: unless-stopped

```yaml
restart: unless-stopped
```

Without a restart policy, a crashed container stays down. `unless-stopped` is the right default for production services: it restarts on failure but respects explicit `docker compose stop` commands during deployments.

`always` is too aggressive — it restarts even after you intentionally stop a container.

### Fix 3: depends_on with service_healthy

```yaml
depends_on:
  app:
    condition: service_healthy
```

The default `condition: service_started` only waits for the container to exist, not for the app to be ready. The worker was starting before Flask finished booting, causing connection errors.

`service_healthy` blocks until the HEALTHCHECK passes — requires a HEALTHCHECK to be defined in the app's Dockerfile.

---

## Verification

```bash
# Check health status
docker inspect $(docker compose ps -q app) --format='{{.State.Health.Status}}'

# View health check log
docker inspect $(docker compose ps -q app) --format='{{json .State.Health.Log}}' | jq .

# Simulate a crash and watch Docker restart it
docker compose exec app kill 1
watch docker compose ps
```

---

## Production Note

`python:3.11-slim` includes curl. If your base image doesn't, either:
- Install curl in the Dockerfile: `RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*`
- Use Python to probe instead: `CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')"`
- Use wget: `CMD wget -qO- http://localhost:5000/health`
