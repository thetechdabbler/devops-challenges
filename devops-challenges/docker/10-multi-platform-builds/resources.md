# Resources — Multi-Platform Builds

## Useful Commands

```bash
# Check current builder
docker buildx ls

# Create a multi-platform builder
docker buildx create --name multiplatform --driver docker-container --use
docker buildx inspect --bootstrap   # verify platforms available

# Build for multiple platforms and push
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag myrepo/myimage:1.0.0 \
  --tag myrepo/myimage:latest \
  --push \
  .

# Build for local testing (one platform at a time with --load)
docker buildx build --platform linux/amd64 --tag myimage:test --load .

# Inspect the multi-arch manifest
docker manifest inspect myrepo/myimage:latest
docker buildx imagetools inspect myrepo/myimage:latest

# Check what platform a local image was built for
docker inspect myimage:test --format='{{.Architecture}}'
```

## Dockerfile Tips for Multi-Platform

```dockerfile
# Most official base images are already multi-arch — no changes needed
FROM python:3.11-slim

# Use build args for platform-specific logic if needed
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "Building on $BUILDPLATFORM for $TARGETPLATFORM"

# For native tools that need platform-specific binaries, use TARGETARCH
ARG TARGETARCH
RUN curl -L "https://example.com/tool-${TARGETARCH}.tar.gz" | tar xz
```

## GitHub Actions Multi-Platform CI

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: myrepo/myimage:latest
```

## Available Platforms

```bash
docker buildx inspect --bootstrap | grep Platforms
# Platforms: linux/amd64, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, ...
```

Common production targets:
- `linux/amd64` — standard x86-64 servers and most CI runners
- `linux/arm64` — AWS Graviton, Apple Silicon, Raspberry Pi 4+

## Official Docs

- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Multi-platform builds](https://docs.docker.com/build/building/multi-platform/)
- [docker/build-push-action (GitHub Actions)](https://github.com/docker/build-push-action)
