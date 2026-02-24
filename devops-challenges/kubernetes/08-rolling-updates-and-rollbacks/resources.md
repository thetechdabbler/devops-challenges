# Resources — Rolling Updates and Rollbacks

## Rollout Commands

```bash
# Update image (triggers rollout)
kubectl set image deployment/<name> <container>=<image:tag>

# Monitor rollout progress
kubectl rollout status deployment/<name>

# View history
kubectl rollout history deployment/<name>
kubectl rollout history deployment/<name> --revision=2

# Rollback
kubectl rollout undo deployment/<name>
kubectl rollout undo deployment/<name> --to-revision=1

# Pause/resume (canary control)
kubectl rollout pause deployment/<name>
kubectl rollout resume deployment/<name>

# Restart all pods without changing image (picks up ConfigMap changes)
kubectl rollout restart deployment/<name>
```

## Deployment Manifest (rollout section)

```yaml
spec:
  revisionHistoryLimit: 3    # keep last 3 ReplicaSets

  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1      # max pods down during rollout
      maxSurge: 1            # max extra pods above desired

  template:
    metadata:
      annotations:
        kubernetes.io/change-cause: "deploy v1.1.0: add config endpoint"
```

## Official Docs

- [Rolling updates](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/)
- [kubectl rollout](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/)
- [Deployment strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#deployment-strategies)
