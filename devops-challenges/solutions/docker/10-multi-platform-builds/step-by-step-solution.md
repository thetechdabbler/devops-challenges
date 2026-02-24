# Solution — Multi-Platform Builds

## The Fixed Files

**build.sh:**
```bash
#!/usr/bin/env bash
set -euo pipefail

# Create or reuse a multi-platform builder
if ! docker buildx inspect multiplatform &>/dev/null; then
  docker buildx create --name multiplatform --driver docker-container --use
else
  docker buildx use multiplatform
fi

# Build and push for both platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag myrepo/devops-app:latest \
  --provenance=false \
  --push \
  .
```

**Dockerfile**: No changes needed — `python:3.11-slim` is already a multi-arch image.

---

## Fixes Applied

### Fix 1: Create a Buildx builder

```bash
docker buildx create --name multiplatform --driver docker-container --use
```

The default `docker` builder only supports the host architecture. The `docker-container` driver spawns a BuildKit container that can cross-compile using QEMU emulation.

`--use` makes this the active builder for subsequent `docker buildx build` commands.

### Fix 2: --platform flag

```bash
# Before
docker build --tag devops-app:latest .

# After
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag devops-app:latest \
  --push \
  .
```

`--platform linux/amd64,linux/arm64` tells Buildx to build both variants and bundle them into a single multi-arch manifest.

### Fix 3: --push instead of --load

Multi-arch manifests cannot be loaded into the local Docker daemon (which stores only one architecture at a time). Use `--push` to push to a registry.

For local testing of a single platform:
```bash
docker buildx build --platform linux/amd64 --tag devops-app:test --load .
```

### Fix 4: --provenance=false

```bash
--provenance=false
```

By default, Buildx attaches SBOM (Software Bill of Materials) provenance attestations to images. Some older registries or tools don't understand the OCI index format this creates. `--provenance=false` disables it for maximum compatibility.

---

## Verification

```bash
# Push to your registry, then inspect the manifest
docker buildx imagetools inspect myrepo/devops-app:latest

# Output shows both platforms:
# Name: myrepo/devops-app:latest
# MediaType: application/vnd.oci.image.index.v1+json
# Digest: sha256:...
#
# Manifests:
#   Name: myrepo/devops-app:latest@sha256:...
#   MediaType: application/vnd.oci.image.manifest.v1+json
#   Platform: linux/amd64
#
#   Name: myrepo/devops-app:latest@sha256:...
#   MediaType: application/vnd.oci.image.manifest.v1+json
#   Platform: linux/arm64
```

---

## GitHub Actions Integration

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          platforms: linux/amd64,linux/arm64
          push: true
          tags: myrepo/devops-app:latest
          provenance: false
```
