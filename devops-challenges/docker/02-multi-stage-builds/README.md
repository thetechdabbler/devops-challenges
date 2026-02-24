# 02 — Multi-Stage Builds

**Level**: Beginner | **Topic**: Docker

Cut your image from ~900MB to under 200MB by separating the build environment from the runtime environment.

## Quick Start

```bash
cp ../../../../shared-resources/app/app.py starter/
cp ../../../../shared-resources/app/requirements.txt starter/
cd starter
docker build -t devops-app:bloated .
docker image ls devops-app:bloated   # note the size
# Now rewrite the Dockerfile as multi-stage, then:
docker build -t devops-app:optimized .
docker image ls devops-app:optimized # compare
```

See [`challenge.md`](./challenge.md) for full instructions.

## Solution

[`solutions/docker/02-multi-stage-builds/`](../../../solutions/docker/02-multi-stage-builds/)
