# Observability Challenges

Instrument, collect, visualize, and alert on metrics, logs, and traces.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [prometheus-basics](./01-prometheus-basics/) | Beginner |
| 02 | [grafana-dashboards](./02-grafana-dashboards/) | Beginner |
| 03 | [alertmanager](./03-alertmanager/) | Beginner |
| 04 | [logging-with-loki](./04-logging-with-loki/) | Intermediate |
| 05 | [distributed-tracing-with-jaeger](./05-distributed-tracing-with-jaeger/) | Intermediate |
| 06 | [opentelemetry-instrumentation](./06-opentelemetry-instrumentation/) | Intermediate |
| 07 | [kubernetes-monitoring](./07-kubernetes-monitoring/) | Intermediate |
| 08 | [log-aggregation-with-elk](./08-log-aggregation-with-elk/) | Advanced |
| 09 | [synthetic-monitoring](./09-synthetic-monitoring/) | Advanced |
| 10 | [slos-and-error-budgets](./10-slos-and-error-budgets/) | Advanced |

## Prerequisites

- Docker and Docker Compose
- `kubectl` configured (exercises 07+)
- Basic understanding of YAML

## Tools Covered

- Prometheus — scrape configs, PromQL, recording rules
- Grafana — dashboards, panels, data source configuration
- Alertmanager — routing, receivers, inhibition rules
- Loki + Promtail — log aggregation and querying
- Jaeger — distributed tracing, spans, sampling
- OpenTelemetry — OTEL Collector pipeline configuration
- kube-state-metrics, node-exporter, ServiceMonitor CRDs
- Elasticsearch, Filebeat, Kibana (ELK stack)
- Blackbox Exporter — synthetic/uptime monitoring
- SLOs, error budgets, burn rate alerts

> **Quick start**: Each exercise ships with a `docker-compose.yml` or Kubernetes manifests so you can run the stack locally.
