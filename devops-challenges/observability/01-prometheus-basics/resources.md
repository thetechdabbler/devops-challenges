# Resources — Prometheus Basics

## Scrape Config Reference

```yaml
global:
  scrape_interval: 15s       # how often to scrape
  evaluation_interval: 15s   # how often to evaluate rules

scrape_configs:
  - job_name: "my-app"
    metrics_path: /metrics   # default, can omit
    scheme: http             # default
    honor_labels: true
    static_configs:
      - targets: ["host:port"]
        labels:
          env: prod
```

## Common PromQL Queries

```promql
# CPU usage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes

# HTTP request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

## Validate and Reload

```bash
promtool check config prometheus.yml
curl -X POST http://localhost:9090/-/reload
```

## Official Docs

- [Prometheus configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
- [PromQL basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
