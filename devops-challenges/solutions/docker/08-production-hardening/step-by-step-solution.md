# Solution — Production Hardening

## The Fixed Files

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 5000

CMD ["python", "app.py"]
```

**docker-compose.yml:**
```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
    read_only: true
    tmpfs:
      - /tmp:size=64m
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: "0.5"
```

---

## Fixes Applied

### Fix 1: Non-root user

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app

USER appuser
```

Run this after installing dependencies (pip needs root) but before `CMD`. The `chown` is needed because files created by root (during `pip install`) are only readable, not writable, by other users.

`-r` creates a system user (no home directory, no login shell). This is correct for service accounts.

### Fix 2: Read-only filesystem

```yaml
read_only: true
```

Prevents the app from writing anywhere except explicitly allowed paths. If the app is compromised:
- Cannot write backdoors to `/usr/bin`
- Cannot modify Python libraries
- Cannot persist malware across restarts

### Fix 3: tmpfs for /tmp

```yaml
tmpfs:
  - /tmp:size=64m
```

Some libraries (including Python's `tempfile` module) need to write temporary files to `/tmp`. The `tmpfs` mount provides an in-memory writable volume, cleared on container restart.

### Fix 4: Drop all capabilities

```yaml
cap_drop:
  - ALL
```

Docker grants 14 capabilities by default. Flask running on port 5000 (unprivileged) needs zero capabilities. Dropping all removes the ability to:
- Load kernel modules (`SYS_MODULE`)
- Change file ownership (`CHOWN`)
- Bind to ports below 1024 (`NET_BIND_SERVICE`) — we're on 5000, so fine
- And 11 more

### Fix 5: no-new-privileges

```yaml
security_opt:
  - no-new-privileges:true
```

Prevents any process inside the container from gaining new privileges via setuid/setgid executables. Even if an attacker finds a setuid binary, this setting blocks privilege escalation.

### Fix 6: Resource limits

```yaml
deploy:
  resources:
    limits:
      memory: 256m
      cpus: "0.5"
```

Without limits, a memory leak or runaway loop consumes all host resources, taking down other containers. With limits, Docker kills or throttles the misbehaving container.

---

## Verification

```bash
# Confirm non-root
docker compose exec app whoami   # → appuser

# Confirm read-only
docker compose exec app touch /app/test.txt   # → permission denied
docker compose exec app touch /tmp/test.txt   # → succeeds

# Confirm capabilities
docker inspect $(docker compose ps -q app) --format='{{.HostConfig.CapDrop}}'

# Confirm memory limit (268435456 = 256MB)
docker inspect $(docker compose ps -q app) --format='{{.HostConfig.Memory}}'
```
