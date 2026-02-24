# Challenge — Health Checks and Restart Policies

## Scenario

Your Flask app is deployed in production via Docker Compose. Ops reports that after a memory leak, the app starts returning 500 errors — but Docker still shows the container as `Up` because the process hasn't crashed. Load balancers keep routing traffic to the dead container for minutes until someone notices.

You need to add a HEALTHCHECK to the Dockerfile so Docker continuously probes the app and marks it `unhealthy` when it stops responding correctly. You also need to configure restart policies so the container automatically recovers.

---

## Problems to Fix

The starter files contain **four** issues:

1. No `HEALTHCHECK` in the Dockerfile — Docker cannot tell if the app is actually healthy
2. No `restart:` policy in `docker-compose.yml` — crashed containers stay down
3. `depends_on:` only waits for the container to start, not for the app to be healthy
4. The `/health` endpoint returns 200 even when the app is broken (it just returns `"status": "healthy"` unconditionally)

---

## Tasks

1. Add a `HEALTHCHECK` instruction to the Dockerfile that probes `GET /health` every 30 seconds
2. Configure the health check to: start checking after 10 seconds, timeout after 5 seconds, retry 3 times before marking unhealthy
3. Add `restart: unless-stopped` to the app service in `docker-compose.yml`
4. Update `depends_on:` for any dependent service to wait for `service_healthy` condition
5. Update the `/health` endpoint in `app.py` to perform a real liveness check (at minimum, verify the app can respond to requests — bonus: check that required env vars are set)

---

## Acceptance Criteria

- [ ] `docker inspect <container> --format='{{.State.Health.Status}}'` returns `healthy`
- [ ] `docker compose ps` shows `(healthy)` next to the app container
- [ ] After `docker compose up`, a dependent service waits for the app to be healthy before starting
- [ ] If you kill the app process inside the container, Docker restarts it automatically
- [ ] `docker inspect` shows `RestartCount` incrementing on repeated failures

---

## Learning Notes

### HEALTHCHECK syntax

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
```

- `--interval`: how often to probe (default 30s)
- `--timeout`: how long to wait for a probe response (default 30s)
- `--start-period`: grace period after container start before failures count (default 0s)
- `--retries`: consecutive failures needed to mark unhealthy (default 3)
- Exit code 0 = healthy, 1 = unhealthy

### Restart policies

| Policy | Behaviour |
|--------|-----------|
| `no` | Never restart (default) |
| `always` | Always restart, even on clean exit |
| `unless-stopped` | Restart on failure; don't restart if manually stopped |
| `on-failure` | Restart only on non-zero exit; optionally `on-failure:3` for max retries |

### depends_on with health condition

```yaml
services:
  worker:
    depends_on:
      app:
        condition: service_healthy   # waits until app HEALTHCHECK passes
```

`condition: service_started` (the default) only waits for the container to exist.
`condition: service_healthy` waits for the health check to return healthy.
