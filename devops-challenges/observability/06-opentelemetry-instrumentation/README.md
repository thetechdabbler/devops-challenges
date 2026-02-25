# Exercise 06 — OpenTelemetry Instrumentation

Fix an OpenTelemetry Collector configuration so it receives OTLP data and exports to Prometheus and Jaeger.

## Quick Start

```bash
docker compose up -d
# Send a test trace
docker compose exec otelcol otelcol --version
open http://localhost:16686  # Jaeger UI
```

## Files

```
starter/
  otel-collector.yml   — OTEL Collector config (5 bugs)
  docker-compose.yml
solutions/
  otel-collector.yml   — fixed config
  step-by-step-solution.md
```
