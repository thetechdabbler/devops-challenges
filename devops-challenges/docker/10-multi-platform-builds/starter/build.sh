#!/usr/bin/env bash
set -euo pipefail

IMAGE="devops-app"
TAG="latest"

# TODO: This uses plain `docker build` which only builds for the host architecture.
# Replace it with `docker buildx build` targeting both linux/amd64 and linux/arm64.
#
# Steps to fix:
# 1. Replace `docker build` with `docker buildx build`
# 2. Add --platform linux/amd64,linux/arm64
# 3. Add --push to push to a registry (or --load for local single-platform testing)
# 4. Add --provenance=false to avoid compatibility issues with older registries

echo "Building ${IMAGE}:${TAG}..."
docker build \
  --tag "${IMAGE}:${TAG}" \
  .

echo "Build complete. Image: ${IMAGE}:${TAG}"
echo ""
echo "Architecture info:"
docker inspect "${IMAGE}:${TAG}" --format='Architecture: {{.Architecture}}'
