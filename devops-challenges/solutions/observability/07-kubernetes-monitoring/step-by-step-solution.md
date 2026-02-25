# Step-by-Step Solution — Kubernetes Monitoring

## Bug 1 — Wrong `apiVersion` for ServiceMonitor

ServiceMonitor is a stable resource in `monitoring.coreos.com/v1`, not `v1alpha1`. Using `v1alpha1` will fail with an unknown CRD version error.

```yaml
# Wrong
apiVersion: monitoring.coreos.com/v1alpha1

# Fixed
apiVersion: monitoring.coreos.com/v1
```

## Bug 2 — Empty `namespaceSelector` matches nothing

An empty `namespaceSelector: {}` does not match all namespaces — it means "no namespace filter applied to _this_ ServiceMonitor's own namespace only." To target specific namespaces, use `matchNames`.

```yaml
# Wrong
namespaceSelector: {}

# Fixed
namespaceSelector:
  matchNames:
    - default
```

To target all namespaces: `namespaceSelector: { any: true }`.

## Bug 3 — Label selector doesn't match Service labels

The ServiceMonitor uses `app: my-app` but the Service has the label `app.kubernetes.io/name: my-app`. Prometheus Operator's label matching is exact.

```yaml
# Wrong
matchLabels:
  app: my-app

# Fixed
matchLabels:
  app.kubernetes.io/name: my-app
```

## Bug 4 — Port must be a named port, not a number

ServiceMonitor `endpoints.port` must reference the **name** of a port in the Service's `spec.ports`. Port numbers are not accepted.

```yaml
# Wrong
port: 8080

# Fixed
port: metrics   # matches Service's port name "metrics"
```

## Bug 5 — `interval` missing unit

Prometheus Operator duration strings require a unit suffix.

```yaml
# Wrong
interval: 30

# Fixed
interval: 30s
```

## Verify

```bash
kubectl apply -f solutions/
kubectl get servicemonitor my-app -n monitoring -o yaml
# Port-forward Prometheus and check /targets
kubectl port-forward svc/prometheus-operated 9090 -n monitoring
```
