# Resources — Resource Limits and Requests

## Useful Commands

```bash
# See resource usage
kubectl top nodes
kubectl top pods

# See requests/limits set on pods
kubectl describe pod <name>   # scroll to "Requests" and "Limits" section

# LimitRange and ResourceQuota
kubectl describe limitrange <name>
kubectl describe resourcequota <name>

# See what's consuming quota
kubectl get resourcequota -o yaml

# Force OOM to test limits (inside container)
kubectl exec <pod> -- python3 -c "bytearray(1024*1024*1024)"  # alloc 1GB
```

## Resource Manifest Reference

```yaml
resources:
  requests:
    memory: "64Mi"   # scheduler guarantee
    cpu: "100m"
  limits:
    memory: "128Mi"  # hard cap — OOMKilled if exceeded
    cpu: "500m"      # throttled if exceeded (not killed)
```

## LimitRange Manifest

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: default
spec:
  limits:
    - type: Container
      default:
        memory: 128Mi
        cpu: 500m
      defaultRequest:
        memory: 64Mi
        cpu: 100m
      max:
        memory: 512Mi
        cpu: "2"
      min:
        memory: 16Mi
        cpu: 10m
```

## ResourceQuota Manifest

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
```

## Official Docs

- [Resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [LimitRange](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
