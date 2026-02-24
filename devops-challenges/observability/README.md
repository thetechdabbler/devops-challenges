# Observability Challenges

Instrument, monitor, and trace your applications — and learn to find problems before users do.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [expose-prometheus-metrics](./01-expose-prometheus-metrics/) | Beginner |
| 02 | [first-grafana-dashboard](./02-first-grafana-dashboard/) | Beginner |
| 03 | [alerting-rules](./03-alerting-rules/) | Beginner |
| 04 | [structured-logging](./04-structured-logging/) | Intermediate |
| 05 | [opentelemetry-instrumentation](./05-opentelemetry-instrumentation/) | Intermediate |
| 06 | [distributed-tracing-with-jaeger](./06-distributed-tracing-with-jaeger/) | Intermediate |
| 07 | [slo-and-error-budgets](./07-slo-and-error-budgets/) | Intermediate |
| 08 | [missing-monitoring](./08-missing-monitoring/) | Advanced |
| 09 | [trace-a-slow-request](./09-trace-a-slow-request/) | Advanced |
| 10 | [full-observability-stack](./10-full-observability-stack/) | Advanced |

## Prerequisites

- Docker Desktop running (all observability tools run via Docker Compose)
- Kubernetes exercises helpful but not required
- Basic understanding of HTTP and JSON

## Tools Covered

- Prometheus (scrape configs, PromQL, recording rules, alert rules)
- Grafana (dashboards, datasources, panels, Alertmanager)
- OpenTelemetry SDK (Python instrumentation)
- Jaeger (distributed tracing backend, trace visualization)
- Alertmanager (routing, inhibitions, silences)
