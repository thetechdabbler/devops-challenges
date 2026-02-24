# 03 — Services and Networking

**Level**: Beginner | **Topic**: Kubernetes

Expose your Deployment with a Kubernetes Service so it's accessible from outside the cluster. Four issues to fix.

## Quick Start

```bash
# Apply the Deployment from exercise 02
kubectl apply -f ../02-deployments-and-replicas/starter/deployment.yaml

# Try the broken Service
kubectl apply -f starter/service.yaml
kubectl get endpoints devops-app-svc   # should show pod IPs — will be empty if selector is wrong

# After fixing:
kubectl apply -f starter/service.yaml
kubectl get service devops-app-svc
curl http://localhost:30080/health
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/03-services-and-networking/`](../../../solutions/kubernetes/03-services-and-networking/)
