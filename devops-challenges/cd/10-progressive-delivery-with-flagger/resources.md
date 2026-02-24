# Resources — Progressive Delivery with Flagger

## Flagger Installation

```bash
# Add Helm repo
helm repo add flagger https://flagger.app
helm repo update

# Install with nginx ingress
helm upgrade -i flagger flagger/flagger \
  --namespace flagger-system \
  --create-namespace \
  --set meshProvider=nginx \
  --set metricsServer=http://prometheus:9090

# Install Grafana dashboard (optional)
helm upgrade -i flagger-grafana flagger/grafana \
  --namespace flagger-system \
  --set url=http://prometheus:9090
```

## Flagger CLI (flagger status)

```bash
# Check canary status
kubectl describe canary devops-app

# Watch live
kubectl get canary devops-app -w

# Events
kubectl get events --field-selector involvedObject.name=devops-app
```

## Canary Status Values

| Status | Meaning |
|--------|---------|
| `Initialized` | Flagger created primary Deployment |
| `Progressing` | Canary rollout in progress |
| `Succeeded` | Promoted to primary |
| `Failed` | Rolled back after threshold exceeded |

## Built-in Metric Templates

```yaml
metrics:
  - name: request-success-rate
    thresholdRange:
      min: 99      # 99% success rate required
    interval: 1m

  - name: request-duration
    thresholdRange:
      max: 500     # max 500ms p99 latency
    interval: 1m
```

## Official Docs

- [Flagger docs](https://docs.flagger.app/)
- [Nginx ingress canary](https://docs.flagger.app/tutorials/nginx-progressive-delivery)
- [Metric analysis](https://docs.flagger.app/usage/metrics)
