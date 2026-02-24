# Exercise 10 — Progressive Delivery with Flagger

Fix a Flagger Canary manifest so new versions roll out automatically based on real traffic metrics with the nginx ingress controller.

## Quick Start

```bash
# Install Flagger (with nginx)
helm repo add flagger https://flagger.app
helm upgrade -i flagger flagger/flagger \
  --namespace flagger-system \
  --set meshProvider=nginx

# Apply the canary
kubectl apply -f starter/canary.yaml

# Watch the canary rollout
kubectl describe canary devops-app
kubectl get canary devops-app -w
```

## Files

- `starter/canary.yaml` — broken Flagger Canary (5 bugs)
- `solutions/canary.yaml` — working Canary manifest
- `solutions/step-by-step-solution.md` — explanation of each fix
