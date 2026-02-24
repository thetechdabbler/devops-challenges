# Challenge — Multi-Platform Builds

## Scenario

Your team uses M1/M2 Macs for development. Production runs on AWS Graviton (ARM64) and x86-64 EC2 instances. A colleague reports that the image you built on your Mac fails to start on the x86-64 CI server with `exec format error`.

Your job: configure Docker Buildx to build images for multiple platforms simultaneously and push a multi-arch manifest to Docker Hub.

---

## Problems to Fix

The starter files contain **three** issues:

1. The Dockerfile uses `apt-get` but doesn't handle cross-compilation correctly for foreign architectures
2. There is no `docker buildx` command in the build script — it uses plain `docker build`
3. The `--platform` flag is missing — the image is built for the host architecture only

---

## Tasks

1. Create (or use the existing) a Buildx builder with multi-platform support
2. Update `build.sh` to use `docker buildx build` with `--platform linux/amd64,linux/arm64`
3. Add `--push` to push the multi-arch manifest to a registry (use `--load` for local testing of a single platform)
4. Add a `--provenance=false` flag to avoid SBOM attestation issues with older registries
5. Verify the manifest contains both platforms

---

## Acceptance Criteria

- [ ] `docker buildx build --platform linux/amd64,linux/arm64 .` completes without error
- [ ] `docker manifest inspect <your-image>` shows entries for both `amd64` and `arm64`
- [ ] Running the image on an M1 Mac (arm64) and on an x86-64 machine both succeed
- [ ] The build script `build.sh` is idempotent — running it twice does not fail

---

## Learning Notes

### Why exec format error?

Docker images contain compiled binaries. An `amd64` binary cannot run on an `arm64` CPU and vice versa. When you `docker build` on a Mac (arm64), you get an arm64 image by default. Pushing it to Docker Hub and pulling on an amd64 host causes `exec format error`.

### Docker Buildx

Buildx is a Docker CLI plugin that extends `docker build` with BuildKit features:

```bash
# Create a new builder with multi-platform support
docker buildx create --name multiplatform --driver docker-container --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag myrepo/myimage:latest \
  --push \
  .

# Build for local testing (single platform, load into docker)
docker buildx build \
  --platform linux/amd64 \
  --tag myrepo/myimage:latest \
  --load \
  .
```

### Multi-arch manifest

A multi-arch manifest is a Docker manifest that points to platform-specific images. When you pull `myimage:latest`, Docker automatically pulls the image matching your architecture.

```bash
# Inspect the manifest
docker manifest inspect myrepo/myimage:latest
```

### Platform-specific base images

Most official images (python, node, nginx) are already multi-arch. `FROM python:3.11-slim` works for both amd64 and arm64. You don't need to change the base image — just build with Buildx.

### --load vs --push

- `--load`: Loads the image into the local Docker daemon (single platform only)
- `--push`: Pushes to a registry as a multi-arch manifest (requires login)
- `--output type=local,dest=./out`: Export image as a directory

For CI/CD, use `--push`. For local testing, use `--load` with a single `--platform`.
