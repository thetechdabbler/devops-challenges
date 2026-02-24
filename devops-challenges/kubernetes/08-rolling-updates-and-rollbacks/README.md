# 08 — Rolling Updates and Rollbacks

**Level**: Intermediate | **Topic**: Kubernetes

Deploy version 1.1.0 with zero downtime and roll back when it breaks. Four issues to fix.

## Quick Start

```bash
kubectl apply -f starter/deployment.yaml
kubectl get pods

# Rolling update
kubectl set image deployment/devops-app app=devops-app:1.1.0
kubectl rollout status deployment/devops-app

# Rollback
kubectl rollout undo deployment/devops-app
kubectl rollout history deployment/devops-app
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/08-rolling-updates-and-rollbacks/`](../../../solutions/kubernetes/08-rolling-updates-and-rollbacks/)
