# Resources — OpenTelemetry Instrumentation

## OTEL Collector Config Structure

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  hostmetrics:
    scrapers:
      cpu:
      memory:

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    limit_mib: 512

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true
  logging:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/jaeger]
    metrics:
      receivers: [otlp, hostmetrics]
      processors: [batch]
      exporters: [prometheus]
```

## Component Naming Conventions

- Receiver: `otlp` (not `otlp_grpc`)
- Prometheus exporter: `prometheus` (not `prometheus_exporter`)
- Named components: `otlp/jaeger` for a second OTLP exporter targeting Jaeger

## Official Docs

- [OTEL Collector overview](https://opentelemetry.io/docs/collector/)
- [Collector config](https://opentelemetry.io/docs/collector/configuration/)
- [Contrib receivers](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver)
