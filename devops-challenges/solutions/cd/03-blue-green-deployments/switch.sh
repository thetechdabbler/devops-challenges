#!/bin/bash
# Switch production traffic to the specified color (blue or green)
# Usage: ./switch.sh green

TARGET=${1:-green}

echo "Switching production traffic to: $TARGET"

# Wait for target deployment to be fully ready
kubectl rollout status deployment/devops-app-${TARGET}

# Patch production Service to select the target color
kubectl patch service devops-app-production \
  -p "{\"spec\":{\"selector\":{\"version\":\"${TARGET}\"}}}"

echo "Done. Production now routes to: $TARGET"
echo "Verify with: kubectl get endpoints devops-app-production"
