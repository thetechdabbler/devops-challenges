# 05 — Persistent Storage

**Level**: Intermediate | **Topic**: Kubernetes

Add a PersistentVolumeClaim to a Deployment so uploaded files survive pod restarts and rollouts. Four issues to fix.

## Quick Start

```bash
kubectl apply -f starter/pvc.yaml     # watch for Bound status
kubectl get pvc
kubectl apply -f starter/deployment.yaml
kubectl exec deploy/devops-app -- sh -c "echo hello > /app/uploads/test.txt"
kubectl delete pod $(kubectl get pods -l app=devops-app -o name | head -1)
kubectl exec deploy/devops-app -- cat /app/uploads/test.txt   # should still exist
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/05-persistent-storage/`](../../../solutions/kubernetes/05-persistent-storage/)
