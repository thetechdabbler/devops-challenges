# Exercise 03 — Blue-Green Deployments

Fix Kubernetes manifests implementing a blue-green deployment strategy with zero-downtime traffic switching.

## Quick Start

```bash
# Apply blue deployment (current production)
kubectl apply -f starter/deployment-blue.yaml
kubectl apply -f starter/service-blue.yaml

# Deploy green (new version)
kubectl apply -f starter/deployment-green.yaml
kubectl apply -f starter/service-green.yaml

# Switch traffic to green
bash starter/switch.sh green
```

## Files

- `starter/deployment-blue.yaml` — blue Deployment
- `starter/deployment-green.yaml` — green Deployment (4 bugs)
- `starter/service-blue.yaml` — blue Service
- `starter/service-green.yaml` — green Service (bug)
- `starter/switch.sh` — traffic switch script (bug)
- `solutions/` — fixed manifests + solution
