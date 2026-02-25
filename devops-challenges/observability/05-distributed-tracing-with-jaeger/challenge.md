# Challenge — Distributed Tracing with Jaeger

## Scenario

Your team uses Jaeger for distributed tracing. A colleague configured a Python Flask app with OpenTelemetry to export traces to Jaeger, but got the exporter endpoint wrong, used the wrong span kind, and broke the Jaeger Docker Compose port mapping.

Fix the configuration and instrumentation so traces appear in the Jaeger UI.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong OTLP exporter endpoint** — `http://jaeger:4317` uses HTTP but OTLP/gRPC uses port `4317` without the `http://` scheme; use `grpc://jaeger:4317` or just `jaeger:4317`
2. **Wrong span kind** — `SpanKind.CLIENT` is for outgoing RPC calls; an HTTP server entry point should use `SpanKind.SERVER`
3. **Jaeger UI port wrong in docker-compose** — Jaeger's web UI is on port `16686`, not `16868` (digits transposed)
4. **`tracer.start_span()` should be `tracer.start_as_current_span()`** — `start_span` doesn't automatically set the span as the active context; use the context manager form
5. **Missing `service.name` resource attribute** — the tracer provider has no `Resource` with `service.name`, so traces appear as `unknown_service` in Jaeger

## Acceptance Criteria

- [ ] Traces appear in Jaeger UI at `http://localhost:16686`
- [ ] Service is named `devops-app` in Jaeger
- [ ] Server spans have `SpanKind.SERVER`
- [ ] OTLP exporter uses gRPC endpoint `jaeger:4317`
- [ ] Spans are set as current context

## Learning Notes

**Python OpenTelemetry setup:**
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

resource = Resource(attributes={"service.name": "devops-app"})
provider = TracerProvider(resource=resource)
exporter = OTLPSpanExporter(endpoint="jaeger:4317", insecure=True)
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("handle-request", kind=trace.SpanKind.SERVER):
    # your code here
    pass
```
