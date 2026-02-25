# Resources — Distributed Tracing with Jaeger

## OpenTelemetry Python Setup

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME

# Resource identifies your service in traces
resource = Resource(attributes={SERVICE_NAME: "my-service"})

provider = TracerProvider(resource=resource)
exporter = OTLPSpanExporter(endpoint="jaeger:4317", insecure=True)
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

# Context manager — sets span as active/current
with tracer.start_as_current_span("operation", kind=trace.SpanKind.SERVER) as span:
    span.set_attribute("http.method", "GET")
    span.set_attribute("http.url", "/api/data")
```

## Jaeger Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 4317 | gRPC | OTLP trace ingest |
| 4318 | HTTP | OTLP trace ingest |
| 16686 | HTTP | Jaeger UI |
| 14268 | HTTP | Jaeger native format |

## SpanKind Values

| Kind | Use case |
|------|---------|
| `SERVER` | Incoming RPC/HTTP request |
| `CLIENT` | Outgoing RPC/HTTP call |
| `PRODUCER` | Message queue publish |
| `CONSUMER` | Message queue consume |
| `INTERNAL` | Internal operation |

## Official Docs

- [OpenTelemetry Python](https://opentelemetry-python.readthedocs.io/)
- [Jaeger deployment](https://www.jaegertracing.io/docs/latest/deployment/)
- [OTLP exporter](https://opentelemetry-python-contrib.readthedocs.io/en/latest/exporter/otlp/otlp.html)
