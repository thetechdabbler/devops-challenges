# Resources — Deployments and Replicas

## Useful Commands

```bash
# Deployment management
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl describe deployment <name>
kubectl rollout status deployment/<name>    # wait for rollout to complete

# Scale
kubectl scale deployment <name> --replicas=5

# ReplicaSet
kubectl get replicasets
kubectl describe replicaset <name>

# Watch pods
kubectl get pods -w
watch kubectl get pods

# Delete deployment (and all its pods)
kubectl delete deployment <name>
kubectl delete -f deployment.yaml
```

## Deployment Manifest Reference

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devops-app
spec:
  replicas: 3
  minReadySeconds: 10

  selector:
    matchLabels:
      app: devops-app           # must match template labels

  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1         # pods that can be down during rollout
      maxSurge: 1               # extra pods above desired count

  template:
    metadata:
      labels:
        app: devops-app         # must match selector
    spec:
      containers:
        - name: app
          image: devops-app:1.0.0
          ports:
            - containerPort: 5000
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "500m"
```

## Resource Units

| Unit | Meaning |
|------|---------|
| `100m` CPU | 0.1 cores (millicores) |
| `1` CPU | 1 core |
| `64Mi` | 64 mebibytes |
| `1Gi` | 1 gibibyte |

## Official Docs

- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Managing resources](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Rolling update strategy](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment)
