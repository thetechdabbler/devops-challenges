# 04 — ConfigMaps and Secrets

**Level**: Intermediate | **Topic**: Kubernetes

Externalize app configuration into a ConfigMap and move secrets out of the Deployment manifest into a Kubernetes Secret. Five issues to fix.

## Quick Start

```bash
kubectl apply -f starter/configmap.yaml   # should succeed
kubectl apply -f starter/secret.yaml      # will fail — bug in data encoding
kubectl apply -f starter/deployment.yaml  # depends on above

# After fixing all three files:
kubectl apply -f starter/
kubectl exec deploy/devops-app -- env | grep APP_ENV
kubectl exec deploy/devops-app -- cat /run/secrets/db-password
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/04-configmaps-and-secrets/`](../../../solutions/kubernetes/04-configmaps-and-secrets/)
