# Challenge — Kubernetes Monitoring

## Scenario

Your team uses the Prometheus Operator with ServiceMonitor CRDs to scrape metrics from applications running in Kubernetes. A colleague wrote the ServiceMonitor and a PodMonitor manifest but got the label selector wrong, used the wrong CRD group, and broke the namespace targeting.

Fix the manifests so the Prometheus Operator discovers and scrapes the application.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong CRD `apiVersion`** — `monitoring.coreos.com/v1alpha1` should be `monitoring.coreos.com/v1` for ServiceMonitor
2. **`namespaceSelector` missing `matchNames`** — `namespaceSelector: {}` matches no namespaces; use `matchNames: [default]` or `any: true`
3. **`selector.matchLabels` key wrong** — the ServiceMonitor selects `app: my-app` but the Service has label `app.kubernetes.io/name: my-app` — labels must match exactly
4. **`endpoints` missing `port` name** — `port: 8080` specifies a port number; ServiceMonitor `endpoints` require the named port from the Service spec, e.g. `port: metrics`
5. **`interval` unit wrong** — `interval: 30` is missing the unit — should be `30s`

## Acceptance Criteria

- [ ] `kubectl apply -f starter/` applies without errors
- [ ] ServiceMonitor `apiVersion` is `monitoring.coreos.com/v1`
- [ ] ServiceMonitor selects Service by correct label key
- [ ] `namespaceSelector` targets the `default` namespace
- [ ] `endpoints` references port by name, interval is `30s`

## Learning Notes

**ServiceMonitor:**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
  namespace: monitoring
  labels:
    release: prometheus   # must match Prometheus CR's serviceMonitorSelector
spec:
  namespaceSelector:
    matchNames:
      - default
  selector:
    matchLabels:
      app.kubernetes.io/name: my-app
  endpoints:
    - port: metrics       # named port from the Service
      interval: 30s
      path: /metrics
```
