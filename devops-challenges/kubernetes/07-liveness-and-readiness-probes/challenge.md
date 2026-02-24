# Challenge — Liveness and Readiness Probes

## Scenario

Your app takes 15 seconds to warm up (loading a model, connecting to a database). During that window, the Service sends it traffic and users see 503 errors. After warm-up, occasionally a memory leak causes the app to hang — it's still `Running` but returns no responses. Kubernetes doesn't know it's broken and never restarts it.

---

## Problems to Fix

The starter `deployment.yaml` has **four** issues:

1. No `readinessProbe` — the Service routes traffic to pods before they're ready
2. No `livenessProbe` — hung pods are never restarted
3. The `initialDelaySeconds` on the liveness probe is `0` — it will kill the pod before it finishes starting
4. The readiness probe checks `/` (root) instead of `/ready` — the root endpoint doesn't accurately reflect readiness

---

## Tasks

1. Add a `readinessProbe` on `/ready` with `initialDelaySeconds: 15` (warm-up time)
2. Add a `livenessProbe` on `/health` with `initialDelaySeconds: 30` (after warm-up)
3. Set appropriate `periodSeconds`, `timeoutSeconds`, and `failureThreshold` values
4. Apply and watch the pod startup: `kubectl get pods -w`
5. Simulate a stuck app and observe the liveness probe trigger a restart

---

## Acceptance Criteria

- [ ] `kubectl describe pod <name>` shows both liveness and readiness probes configured
- [ ] `kubectl get pods -w` shows the pod start as `0/1 Running` (not ready) then transition to `1/1 Running`
- [ ] Traffic is only routed to the pod after the readiness probe passes (no 503s during startup)
- [ ] A simulated hung pod (add a `sleep` that blocks `/health`) is restarted by the liveness probe

---

## Learning Notes

### Probe types

| Probe | Purpose | Failure Action |
|-------|---------|---------------|
| `livenessProbe` | Is the container alive? | Restart the container |
| `readinessProbe` | Is the container ready for traffic? | Remove from Service endpoints |
| `startupProbe` | Has the app finished starting? | Disable liveness until this passes |

### HTTP probe configuration

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30   # wait 30s before first check
  periodSeconds: 10          # check every 10s
  timeoutSeconds: 5          # fail if no response in 5s
  failureThreshold: 3        # restart after 3 consecutive failures
  successThreshold: 1        # required successes to mark healthy

readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 15
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
  successThreshold: 1
```

### Other probe types

```yaml
# TCP socket probe
livenessProbe:
  tcpSocket:
    port: 5000

# Exec probe (run a command inside the container)
livenessProbe:
  exec:
    command: ["python", "-c", "import requests; requests.get('http://localhost:5000/health')"]
```

### startupProbe (for slow-starting apps)

```yaml
startupProbe:
  httpGet:
    path: /health
    port: 5000
  failureThreshold: 30    # allow up to 30 × periodSeconds for startup
  periodSeconds: 10       # = 5 minutes max startup time
```

Use `startupProbe` for apps with unpredictable startup times. Once it passes, liveness and readiness take over.
