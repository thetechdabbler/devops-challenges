# Resources — Liveness and Readiness Probes

## Useful Commands

```bash
# Watch pod transitions (0/1 → 1/1)
kubectl get pods -w

# See probe config and events
kubectl describe pod <name>

# Check endpoints (only ready pods are included)
kubectl get endpoints <service-name>

# Simulate unhealthy (exec into pod, block /health)
kubectl exec <pod> -- kill -STOP 1   # pause process — liveness probe will fail

# View probe events in logs
kubectl events --for pod/<name>
```

## Probe Manifest Reference

```yaml
containers:
  - name: app
    livenessProbe:
      httpGet:
        path: /health
        port: 5000
      initialDelaySeconds: 30   # grace period after container start
      periodSeconds: 10          # probe frequency
      timeoutSeconds: 5          # fail if no response in 5s
      failureThreshold: 3        # restart after 3 consecutive failures
      successThreshold: 1        # successes to mark healthy (liveness: must be 1)

    readinessProbe:
      httpGet:
        path: /ready
        port: 5000
      initialDelaySeconds: 15
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
      successThreshold: 1        # successes to mark ready (can be > 1)

    startupProbe:               # use for slow-starting apps
      httpGet:
        path: /health
        port: 5000
      failureThreshold: 30      # allow 30 × 10s = 5 minutes startup
      periodSeconds: 10
```

## Probe Types

```yaml
# HTTP (most common for web apps)
httpGet:
  path: /health
  port: 5000
  httpHeaders:
    - name: Authorization
      value: "Bearer healthcheck-token"

# TCP socket (for non-HTTP services)
tcpSocket:
  port: 5432

# Exec (run command in container)
exec:
  command:
    - sh
    - -c
    - "redis-cli ping | grep PONG"
```

## Official Docs

- [Configure liveness, readiness, startup probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
