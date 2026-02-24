# Resources — Production Hardening

## Useful Commands

```bash
# Check who the container runs as
docker compose exec app whoami
docker inspect <container> --format='{{.Config.User}}'

# Check if filesystem is read-only
docker inspect <container> --format='{{.HostConfig.ReadonlyRootfs}}'

# View Linux capabilities
docker inspect <container> --format='{{.HostConfig.CapDrop}}'
docker inspect <container> --format='{{.HostConfig.CapAdd}}'

# Check resource limits (bytes)
docker inspect <container> --format='{{.HostConfig.Memory}}'     # 0 = unlimited
docker inspect <container> --format='{{.HostConfig.NanoCpus}}'   # 1e9 = 1 CPU

# View security options
docker inspect <container> --format='{{.HostConfig.SecurityOpt}}'

# Test filesystem write permissions
docker compose exec app touch /app/test.txt    # should fail (read-only)
docker compose exec app touch /tmp/test.txt    # should succeed (tmpfs)
```

## Non-root User Pattern

```dockerfile
# Option 1: Create a dedicated user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Option 2: Use a numeric UID (avoids needing user names in the image)
USER 1001
```

## Read-only Filesystem + tmpfs

```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp:size=64m        # in-memory; cleared on container restart
      - /var/run:size=1m     # needed for PID files
```

## Linux Capabilities

```yaml
services:
  app:
    cap_drop:
      - ALL                  # drop everything
    cap_add:
      - NET_BIND_SERVICE     # only if binding to ports < 1024
    security_opt:
      - no-new-privileges:true   # prevents setuid binaries from escalating
```

## Resource Limits (Compose v3 with deploy)

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 256m
          cpus: "0.5"
        reservations:
          memory: 128m
          cpus: "0.25"
```

## Official Docs

- [Docker security best practices](https://docs.docker.com/develop/security-best-practices/)
- [Linux capabilities in Docker](https://docs.docker.com/engine/security/#linux-kernel-capabilities)
- [seccomp profiles](https://docs.docker.com/engine/security/seccomp/)
- [Read-only containers](https://docs.docker.com/engine/reference/run/#read-only)
