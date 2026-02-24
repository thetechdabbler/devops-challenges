# 02 — Deployments and Replicas

**Level**: Beginner | **Topic**: Kubernetes

Upgrade from a single Pod to a self-healing, multi-replica Deployment. Five issues to fix.

## Quick Start

```bash
kubectl apply -f starter/deployment.yaml   # will fail or misbehave — read the error
kubectl get pods
kubectl get deployment devops-app

# After fixing:
kubectl get pods                           # should show 3 pods
kubectl delete pod <one-of-the-pods>
kubectl get pods -w                        # watch it get replaced
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/02-deployments-and-replicas/`](../../../solutions/kubernetes/02-deployments-and-replicas/)
