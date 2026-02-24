# Exercise 01 — GitOps with ArgoCD

Fix a broken ArgoCD Application manifest so your app syncs automatically via GitOps.

## Quick Start

```bash
# Apply fixed manifest
kubectl apply -f starter/application.yaml

# Check sync status
argocd app get devops-app

# Watch sync events
kubectl get events -n argocd --watch
```

## Files

- `starter/application.yaml` — broken ArgoCD Application (5 bugs)
- `solutions/application.yaml` — working manifest
- `solutions/step-by-step-solution.md` — explanation of each fix
