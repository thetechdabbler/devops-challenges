# Solution — Rolling Updates and Rollbacks

## Fixes Applied

### Fix 1: RollingUpdate strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

Without this, Kubernetes uses the default (RollingUpdate with 25% maxUnavailable, 25% maxSurge). Being explicit prevents surprises when replica counts change.

### Fix 2: revisionHistoryLimit: 3

```yaml
revisionHistoryLimit: 3
```

Each rollout creates a new ReplicaSet. Without a limit, old ReplicaSets accumulate (default: 10). Setting `3` keeps enough for rollback without polluting `kubectl get rs`.

### Fix 3: Pin image tag

```yaml
image: devops-app:1.0.0   # was :latest
```

`kubectl rollout undo` works by switching back to a previous ReplicaSet. If all ReplicaSets use `:latest`, a rollback does nothing — they all run the same (current) image.

### Fix 4: change-cause annotation

```yaml
annotations:
  kubernetes.io/change-cause: "deploy v1.0.0: initial release"
```

This annotation appears in `kubectl rollout history`:

```
REVISION  CHANGE-CAUSE
1         deploy v1.0.0: initial release
2         deploy v1.1.0: add config endpoint
```

---

## Rolling Update Walkthrough

```bash
# Deploy v1.0.0
kubectl apply -f deployment.yaml

# Update to v1.1.0
kubectl set image deployment/devops-app app=devops-app:1.1.0
kubectl annotate deployment/devops-app kubernetes.io/change-cause="deploy v1.1.0: add config endpoint" --overwrite

# Watch pods cycle
kubectl rollout status deployment/devops-app
kubectl get pods -w   # see v1.0.0 pods terminate as v1.1.0 pods become ready

# View history
kubectl rollout history deployment/devops-app

# Rollback
kubectl rollout undo deployment/devops-app
kubectl rollout status deployment/devops-app

# Rollback to specific revision
kubectl rollout undo deployment/devops-app --to-revision=1
```
