# Solution — Liveness and Readiness Probes

## The Fixed Manifest

```yaml
readinessProbe:           # Fix 1: added
  httpGet:
    path: /ready          # Fix 4: specific readiness endpoint
    port: 5000
  initialDelaySeconds: 15
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

livenessProbe:
  httpGet:
    path: /health         # Fix 4: was /, now /health
    port: 5000
  initialDelaySeconds: 30  # Fix 3: was 0, now 30s grace period
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

---

## Fixes Applied

### Fix 1: Add readinessProbe

Without a readiness probe, the pod is added to Service endpoints the moment it enters `Running` state — before Flask finishes starting. During that window, the Service routes traffic to the pod and users see connection errors.

`readinessProbe` tells Kubernetes: "don't send traffic until this check passes."

### Fix 2: readinessProbe uses /ready

The `/ready` endpoint can return 503 while the app is initializing (connecting to a database, loading a model). The `/health` endpoint (for liveness) should only fail if the process is actually broken.

Using the same endpoint for both means you can't distinguish "still starting" from "permanently broken."

### Fix 3: initialDelaySeconds: 30 on liveness

With `initialDelaySeconds: 0`, the liveness probe starts immediately. If Flask takes more than `timeoutSeconds` to start, Kubernetes kills the pod before it finishes booting — creating a crash loop.

`initialDelaySeconds: 30` gives the app time to start before liveness checks begin.

### Fix 4: Probe path /health

The root `/` endpoint returns 200 even if the app is broken. The dedicated `/health` endpoint should perform actual health checks (verify required env vars are set, connections are working, etc.).

---

## Observing Probe Behavior

```bash
kubectl apply -f deployment.yaml

# Watch the pod transition from 0/1 to 1/1 (readiness delay)
kubectl get pods -w

# See probe configuration and recent events
kubectl describe pod <pod-name>

# Simulate a stuck pod
kubectl exec <pod> -- kill -STOP 1    # pause the process
# Wait ~30s for 3 liveness failures
kubectl get pods -w                    # pod restarts

# See that Service only routes to ready pods
kubectl get endpoints devops-app-svc  # empty until readiness passes
```
