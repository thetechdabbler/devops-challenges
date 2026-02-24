# 06 — Resource Limits and Requests

**Level**: Intermediate | **Topic**: Kubernetes

Stop noisy-neighbor problems by adding resource requests and limits to your Deployment and enforcing namespace-wide quotas with LimitRange and ResourceQuota. Five issues to fix.

## Quick Start

```bash
kubectl apply -f starter/limitrange.yaml
kubectl apply -f starter/resourcequota.yaml
kubectl apply -f starter/deployment.yaml   # will be rejected if limits exceed LimitRange

kubectl describe limitrange dev-limits
kubectl describe resourcequota dev-quota
kubectl describe pod <name>   # shows requests and limits
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/06-resource-limits-and-requests/`](../../../solutions/kubernetes/06-resource-limits-and-requests/)
