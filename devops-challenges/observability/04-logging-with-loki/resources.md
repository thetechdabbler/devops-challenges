# Resources — Logging with Loki

## Promtail Config

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml   # must be absolute path

clients:
  - url: http://loki:3100/loki/api/v1/push   # note the loki/ prefix

scrape_configs:
  - job_name: app
    static_configs:
      - targets: [localhost]
        labels:
          job: my-app
          __path__: /var/log/app/*.log   # glob pattern for log files

    pipeline_stages:
      - json:
          expressions:
            level: level
            message: msg
      - labels:
          level:    # promote parsed field to label
```

## LogQL Queries

```logql
# All logs from a job
{job="devops-app"}

# Filter by level
{job="devops-app"} |= "error"

# Parse JSON and filter
{job="devops-app"} | json | level="error"

# Rate of error logs
rate({job="devops-app"} |= "error" [5m])
```

## Official Docs

- [Loki overview](https://grafana.com/docs/loki/latest/)
- [Promtail configuration](https://grafana.com/docs/loki/latest/clients/promtail/configuration/)
- [Pipeline stages](https://grafana.com/docs/loki/latest/clients/promtail/stages/)
- [LogQL](https://grafana.com/docs/loki/latest/logql/)
