# Resources — Health Checks and Restart Policies

## Useful Commands

```bash
# Check container health status
docker inspect <container> --format='{{.State.Health.Status}}'

# View full health check log (last 5 results)
docker inspect <container> --format='{{json .State.Health}}' | jq .

# Watch container status live
watch docker compose ps

# Force a health check to run immediately (useful for debugging)
docker inspect <container> --format='{{.State.Health.Log}}'

# See restart count
docker inspect <container> --format='{{.RestartCount}}'
```

## HEALTHCHECK Reference

```dockerfile
HEALTHCHECK [OPTIONS] CMD <command>

Options:
  --interval=DURATION   (default: 30s)
  --timeout=DURATION    (default: 30s)
  --start-period=DURATION  (default: 0s)
  --retries=N           (default: 3)

# Examples
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://localhost:5000/health || exit 1

# Disable inherited HEALTHCHECK from base image
HEALTHCHECK NONE
```

## Restart Policy Reference

```yaml
# docker-compose.yml
services:
  app:
    restart: "no"           # never restart (default)
    restart: always         # always restart
    restart: unless-stopped # restart on failure; don't restart if manually stopped
    restart: on-failure     # restart only on non-zero exit
    # restart: on-failure:3 # max 3 retries (docker run syntax only)
```

## depends_on Conditions

```yaml
services:
  worker:
    depends_on:
      app:
        condition: service_started    # default: container exists
      db:
        condition: service_healthy    # HEALTHCHECK passes
      migration:
        condition: service_completed_successfully  # exited with 0
```

## Official Docs

- [HEALTHCHECK instruction](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Start containers automatically (restart policies)](https://docs.docker.com/config/containers/start-containers-automatically/)
- [Compose depends_on](https://docs.docker.com/compose/compose-file/05-services/#depends_on)
