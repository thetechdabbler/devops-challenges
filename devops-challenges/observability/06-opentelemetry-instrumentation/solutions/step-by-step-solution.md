# Step-by-Step Solution — OpenTelemetry Instrumentation

## Bug 1 — Wrong receiver name `otlp_grpc`

The OTLP receiver is named `otlp`. It handles both gRPC and HTTP under `protocols`. There is no `otlp_grpc` receiver.

```yaml
# Wrong
otlp_grpc:

# Fixed
otlp:
  protocols:
    grpc:
      endpoint: 0.0.0.0:4317
```

## Bug 2 — Wrong exporter name `prometheus_exporter`

The Prometheus exporter is named `prometheus`. There is no `prometheus_exporter`.

```yaml
# Wrong
prometheus_exporter:
  endpoint: "0.0.0.0:8889"

# Fixed
prometheus:
  endpoint: "0.0.0.0:8889"
```

## Bug 3 — Empty `processors: []` is invalid

Pipelines must either omit `processors` or list at least one valid processor. Use `[batch]`.

```yaml
# Wrong
processors: []

# Fixed
processors: [batch]
```

## Bug 4 — Pipeline references undefined exporter `prom`

The exporter is named `prometheus` but the metrics pipeline references `prom`. Names must match exactly.

```yaml
# Wrong
exporters: [prom]

# Fixed
exporters: [prometheus]
```

## Bug 5 — Jaeger endpoint missing port

The OTLP/gRPC connection requires an explicit port. Without `:4317`, the connection fails.

```yaml
# Wrong
endpoint: jaeger

# Fixed
endpoint: jaeger:4317
```

## Verify

```bash
docker compose up -d
docker compose logs otelcol | grep -i error
# No errors → collector is running
```
