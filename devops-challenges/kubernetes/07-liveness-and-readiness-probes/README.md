# 07 — Liveness and Readiness Probes

**Level**: Intermediate | **Topic**: Kubernetes

Add health probes so Kubernetes can detect when a pod is ready for traffic and when it needs to be restarted. Four issues to fix.

## Quick Start

```bash
kubectl apply -f starter/deployment.yaml
kubectl get pods -w   # watch — pod should show 0/1 then 1/1

# After fixing:
kubectl describe pod <name>   # shows both probes
kubectl get endpoints devops-app-svc   # empty until readiness passes
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/07-liveness-and-readiness-probes/`](../../../solutions/kubernetes/07-liveness-and-readiness-probes/)
