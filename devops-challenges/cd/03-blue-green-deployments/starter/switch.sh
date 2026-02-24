#!/bin/bash
# Switch production traffic to the specified color (blue or green)
# Usage: ./switch.sh green

TARGET=${1:-green}

echo "Switching production traffic to: $TARGET"

# Wait for target deployment to be ready
kubectl rollout status deployment/devops-app-${TARGET}

# BUG 5: patching the wrong label key — 'color' doesn't exist, should be 'version'
kubectl patch service devops-app-production \
  -p "{\"spec\":{\"selector\":{\"color\":\"${TARGET}\"}}}"

echo "Done. Production now routes to: $TARGET"
