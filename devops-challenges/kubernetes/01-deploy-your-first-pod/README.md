# 01 — Deploy Your First Pod

**Level**: Beginner | **Topic**: Kubernetes

Write and fix a Pod manifest, apply it to a local cluster, and learn the core kubectl workflow. Five errors to fix.

## Prerequisites

- Docker Desktop with Kubernetes enabled, or `minikube start`
- `kubectl` installed and pointing at your local cluster
- The sample app image: `docker build -t devops-app:1.0.0 ../../../../shared-resources/app/`

## Quick Start

```bash
# Verify your cluster is running
kubectl cluster-info

# Try applying the broken manifest first
kubectl apply -f starter/pod.yaml   # will fail — read the error

# Fix the errors, then:
kubectl apply -f starter/pod.yaml
kubectl get pods
kubectl port-forward pod/devops-app 8080:5000
curl http://localhost:8080/health
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/01-deploy-your-first-pod/`](../../../solutions/kubernetes/01-deploy-your-first-pod/)
