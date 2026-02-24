# Challenge — Production Hardening

## Scenario

Your Flask app is running in production. A security audit flags several container configuration issues: the app runs as root, the filesystem is writable (making it vulnerable to a compromised app writing files), and the image includes unnecessary capabilities that could be exploited.

Your job: harden the container without breaking the application.

---

## Problems to Fix

The starter files contain **six** issues:

1. The container runs as `root` — if the app is compromised, the attacker has root inside the container
2. No `USER` instruction in the Dockerfile — base images default to root
3. The entire filesystem is writable — should be read-only except for specific temp directories
4. The container has default Linux capabilities that aren't needed (e.g., `NET_ADMIN`, `SYS_PTRACE`)
5. No resource limits — the container can consume all host CPU and memory
6. The image includes the full pip cache and build tools

---

## Tasks

1. Add a `USER` instruction to the Dockerfile — create a non-root user `appuser` and run as that user
2. Set `read_only: true` in `docker-compose.yml` for the app service
3. Mount a `tmpfs` volume for `/tmp` so the app can still write temporary files
4. Drop all capabilities with `cap_drop: ["ALL"]` and add back only what Flask needs (nothing for this app)
5. Add memory and CPU limits: `memory: 256m`, `cpus: "0.5"`
6. Set `security_opt: ["no-new-privileges:true"]` to prevent privilege escalation

---

## Acceptance Criteria

- [ ] `docker compose exec app whoami` returns `appuser`, not `root`
- [ ] `docker inspect <container> --format='{{.HostConfig.ReadonlyRootfs}}'` returns `true`
- [ ] `docker compose exec app touch /app/test.txt` fails (read-only filesystem)
- [ ] `docker compose exec app touch /tmp/test.txt` succeeds (tmpfs is writable)
- [ ] `docker inspect <container> --format='{{.HostConfig.CapDrop}}'` shows `[ALL]`
- [ ] `docker inspect <container> --format='{{.HostConfig.Memory}}'` shows `268435456` (256MB)
- [ ] The app still responds to `GET /health`

---

## Learning Notes

### Non-root user

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

Files owned by root in the image are still readable by the non-root user. Only writing is restricted. If your app needs to write to a specific directory, `chown` it before the `USER` instruction.

### Read-only filesystem

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp           # in-memory writable volume for temp files
      - /var/run       # needed by some apps for PID files
```

A read-only filesystem means a compromised app can't persist malware, modify binaries, or write to unexpected locations.

### Capabilities

Linux capabilities break root privileges into discrete units. By default, Docker grants 14 capabilities. Most apps need zero.

```yaml
security_opt:
  - no-new-privileges:true   # prevents setuid binaries from escalating
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE   # only if you bind to ports < 1024 as non-root
```

### Resource limits

```yaml
deploy:
  resources:
    limits:
      memory: 256m
      cpus: "0.5"
```

Without limits, a single misbehaving container can starve the host of memory or CPU.
