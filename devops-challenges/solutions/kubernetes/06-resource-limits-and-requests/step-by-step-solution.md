# Solution — Resource Limits and Requests

## Fixes Applied

### Fix 1 & 2: Add resources to main container

```yaml
resources:
  requests:
    memory: "64Mi"    # scheduler reserves this on the node
    cpu: "100m"
  limits:
    memory: "256Mi"   # OOMKilled if exceeded
    cpu: "500m"       # throttled (not killed) if exceeded
```

Without requests, the scheduler places pods arbitrarily — including on already-overloaded nodes. Without limits, one pod can starve all others.

### Fix 3: LimitRange max memory

```yaml
max:
  memory: 512Mi   # was 4Gi
  cpu: "2"
```

Setting a tight max forces developers to think about what their containers actually need. It also prevents runaway configs from getting into production.

### Fix 4: requests.cpu in ResourceQuota

```yaml
requests.cpu: "4"   # added
```

Without a CPU request quota, a namespace can have unlimited CPU requests, defeating the purpose of resource management. Add both `requests.cpu` and `requests.memory` to get full coverage.

### Fix 5: Resources on init container

```yaml
initContainers:
  - name: init-check
    resources:
      requests:
        memory: "32Mi"
        cpu: "50m"
      limits:
        memory: "64Mi"
        cpu: "100m"
```

Init containers run sequentially before the main container and consume resources too. When a ResourceQuota is active, pods without resource specs on init containers will be rejected.

---

## Verification

```bash
kubectl apply -f limitrange.yaml -f resourcequota.yaml -f deployment.yaml

# See requests and limits
kubectl describe pod $(kubectl get pods -l app=devops-app -o name | head -1)

# Try to exceed LimitRange
kubectl run too-big --image=nginx --requests='memory=1Gi'
# Error: memory max limit is 512Mi

# View quota usage
kubectl describe resourcequota dev-quota
```
