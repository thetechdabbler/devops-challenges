# Challenge — Resource Limits and Requests

## Scenario

Your production cluster starts experiencing "noisy neighbor" problems: one runaway pod consuming all CPU is slowing down every other workload on the node. Meanwhile, the scheduler is placing too many pods on the same node because it doesn't know how much memory each pod needs.

You need to add resource requests and limits to ensure fair scheduling and prevent resource starvation.

---

## Problems to Fix

The starter `deployment.yaml` has **five** issues:

1. No `resources.requests` — scheduler can't make informed placement decisions
2. No `resources.limits` — a memory leak will consume all node memory (OOMKilled)
3. The `LimitRange` in `limitrange.yaml` has `max.memory: 4Gi` — too high for dev cluster; use `512Mi`
4. The `ResourceQuota` `requests.cpu` is missing — add a namespace CPU quota
5. No `resources` on the init container — init containers also need resource requests

---

## Tasks

1. Add `resources.requests` and `resources.limits` to the main container
2. Add `resources` to the init container
3. Fix the `LimitRange` max values for the dev cluster
4. Apply the `ResourceQuota` with both CPU and memory request limits
5. Try to create a pod that exceeds the LimitRange — observe the error

---

## Acceptance Criteria

- [ ] `kubectl describe pod <name>` shows non-zero Requests and Limits
- [ ] `kubectl describe limitrange dev-limits` shows configured min/max
- [ ] `kubectl describe resourcequota dev-quota` shows used vs allowed CPU/memory
- [ ] Creating a pod with `memory: 1Gi` limit is rejected by the LimitRange

---

## Learning Notes

### Requests vs Limits

```
Requests: What the scheduler reserves on a node (soft guarantee)
Limits:   What the container is allowed to use (hard cap)
```

- CPU limit exceeded → throttled (slower, not killed)
- Memory limit exceeded → OOMKilled (process killed immediately)

### Resource units

```
CPU:    1     = 1 core
        500m  = 0.5 core (millicores)
        100m  = 0.1 core

Memory: 64Mi  = 64 mebibytes
        512Mi = 512 mebibytes
        1Gi   = 1 gibibyte
```

### LimitRange — per-pod defaults and caps

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
spec:
  limits:
    - type: Container
      default:          # applied if container has no resources
        memory: 128Mi
        cpu: 500m
      defaultRequest:   # applied if container has no requests
        memory: 64Mi
        cpu: 100m
      max:              # rejected if container exceeds this
        memory: 512Mi
        cpu: "2"
      min:              # rejected if container is below this
        memory: 16Mi
        cpu: 10m
```

### ResourceQuota — per-namespace totals

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
