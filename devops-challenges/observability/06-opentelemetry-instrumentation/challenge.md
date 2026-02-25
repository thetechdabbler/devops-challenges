# Challenge — OpenTelemetry Instrumentation

## Scenario

Your team uses an OpenTelemetry Collector to receive traces and metrics from applications and export them to multiple backends. A colleague wrote the OTEL Collector config pipeline but got the receiver and exporter names wrong, left an empty `processors` list, and broke the pipeline service binding.

Fix the collector configuration so it receives OTLP data and exports to both Prometheus and Jaeger.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong receiver name** — `otlp_grpc:` should be `otlp:` — the OTLP receiver handles both gRPC and HTTP via sub-keys
2. **Wrong Prometheus exporter name** — `prometheus_exporter:` should be `prometheus:` in the exporters block
3. **Empty processors list breaks pipeline** — `processors: []` is invalid; either remove the key or use `processors: [batch]`
4. **Pipeline references undefined exporter** — `exporters: [prom, jaeger]` uses `prom` but the exporter is named `prometheus`
5. **OTLP exporter endpoint for Jaeger missing port** — `endpoint: jaeger` should be `endpoint: jaeger:4317`

## Acceptance Criteria

- [ ] Collector starts without errors
- [ ] OTLP receiver accepts gRPC on port 4317
- [ ] Metrics are exported to Prometheus on port 8889
- [ ] Traces are exported to Jaeger on port 4317
- [ ] Pipeline uses `batch` processor

## Learning Notes

**OTEL Collector config structure:**
```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```
