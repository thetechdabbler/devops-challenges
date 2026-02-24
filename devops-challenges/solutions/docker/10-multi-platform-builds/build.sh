#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-devops-app}"
TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-}"   # set to e.g. "docker.io/myusername" to push

FULL_IMAGE="${REGISTRY:+${REGISTRY}/}${IMAGE}:${TAG}"

# Create or reuse a multi-platform builder
if ! docker buildx inspect multiplatform &>/dev/null; then
  echo "Creating multiplatform builder..."
  docker buildx create --name multiplatform --driver docker-container --use
else
  docker buildx use multiplatform
fi

echo "Building ${FULL_IMAGE} for linux/amd64 and linux/arm64..."

if [[ -n "${REGISTRY}" ]]; then
  # Push multi-arch manifest to registry
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag "${FULL_IMAGE}" \
    --provenance=false \
    --push \
    .
  echo ""
  echo "Pushed: ${FULL_IMAGE}"
  echo "Inspect manifest:"
  echo "  docker buildx imagetools inspect ${FULL_IMAGE}"
else
  # Local test build — single platform, load into daemon
  echo "No REGISTRY set — building for local platform only (--load)"
  docker buildx build \
    --platform linux/$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') \
    --tag "${IMAGE}:${TAG}" \
    --load \
    .
  echo ""
  docker inspect "${IMAGE}:${TAG}" --format='Built for architecture: {{.Architecture}}'
fi
