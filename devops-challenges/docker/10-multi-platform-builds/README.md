# 10 — Multi-Platform Builds

**Level**: Advanced | **Topic**: Docker

Fix an image that causes `exec format error` on x86-64 by using Docker Buildx to build for both `linux/amd64` and `linux/arm64` simultaneously.

## Quick Start

```bash
cp ../../../../shared-resources/app/app.py starter/
cp ../../../../shared-resources/app/requirements.txt starter/
cd starter

# Create a buildx builder (one-time setup)
docker buildx create --name multiplatform --driver docker-container --use

# Try the broken build script first
chmod +x build.sh
./build.sh

# Then fix it and verify the manifest covers both platforms
```

See [`challenge.md`](./challenge.md) for the full task list and acceptance criteria.

## Solution

[`solutions/docker/10-multi-platform-builds/`](../../../solutions/docker/10-multi-platform-builds/)
