# 04 — Optimize Image Size

**Level**: Intermediate | **Topic**: Docker

Shrink a 1.2GB image to under 150MB by fixing every Dockerfile anti-pattern. Six problems to find, one optimized image to produce.

## Quick Start

```bash
cp ../../../../shared-resources/app/app.py starter/
cp ../../../../shared-resources/app/requirements.txt starter/
cd starter
docker build -t devops-app:fat .
docker image ls devops-app:fat    # note the size
docker history devops-app:fat     # audit the layers
# Fix the Dockerfile and .dockerignore, then:
docker build -t devops-app:lean .
docker image ls devops-app:lean
```

See [`challenge.md`](./challenge.md) for the full list of anti-patterns to fix.

## Solution

[`solutions/docker/04-optimize-image-size/`](../../../solutions/docker/04-optimize-image-size/)
