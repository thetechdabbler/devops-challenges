# Resources — Kubernetes Monitoring

## ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app
  namespace: monitoring
  labels:
    release: prometheus
spec:
  namespaceSelector:
    matchNames:
      - production
  selector:
    matchLabels:
      app.kubernetes.io/name: my-app
  endpoints:
    - port: metrics       # named port from Service.spec.ports
      interval: 30s
      path: /metrics
      scheme: http
```

## Service with Named Port

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
  labels:
    app.kubernetes.io/name: my-app
spec:
  selector:
    app: my-app
  ports:
    - name: metrics       # this name is referenced in ServiceMonitor
      port: 8080
      targetPort: 8080
```

## Useful Commands

```bash
# Check if ServiceMonitor is picked up
kubectl get servicemonitor -n monitoring -o yaml

# Check Prometheus targets
kubectl port-forward svc/prometheus-operated 9090 -n monitoring
open http://localhost:9090/targets
```

## Official Docs

- [Prometheus Operator](https://prometheus-operator.dev/docs/user-guides/getting-started/)
- [ServiceMonitor CRD](https://prometheus-operator.dev/docs/operator/api/#servicemonitor)
- [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)
