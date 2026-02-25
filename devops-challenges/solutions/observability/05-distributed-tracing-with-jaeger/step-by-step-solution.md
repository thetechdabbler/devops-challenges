# Step-by-Step Solution — Distributed Tracing with Jaeger

## Bug 1 — Wrong OTLP gRPC endpoint scheme

The OTLP gRPC exporter uses raw gRPC, not HTTP. The endpoint should be `host:port` without `http://`.

```python
# Wrong
endpoint="http://jaeger:4317"

# Fixed
endpoint="jaeger:4317"
```

## Bug 2 — Wrong SpanKind for HTTP server

`SpanKind.CLIENT` is for outgoing calls your service makes. The route handler receives incoming requests, which is `SpanKind.SERVER`.

```python
kind=trace.SpanKind.SERVER
```

## Bug 3 — Jaeger UI port transposed

The Jaeger all-in-one web UI listens on **16686**, not 16868.

```yaml
# Wrong
- "16868:16686"

# Fixed
- "16686:16686"
```

## Bug 4 — `start_span()` instead of `start_as_current_span()`

`start_span()` creates a span but doesn't make it the active context. Subsequent child spans won't be parented to it. Use `start_as_current_span()` as a context manager.

```python
# Wrong
span = tracer.start_span("handle-request", ...)
# ... code ...
span.end()

# Fixed
with tracer.start_as_current_span("handle-request", ...) as span:
    # code here — span automatically ends on exit
```

## Bug 5 — Missing `service.name` Resource

Without a `Resource`, Jaeger labels the service as `unknown_service`. Add a Resource with `SERVICE_NAME`.

```python
from opentelemetry.sdk.resources import Resource, SERVICE_NAME

resource = Resource(attributes={SERVICE_NAME: "devops-app"})
provider = TracerProvider(resource=resource)
```

## Verify

```bash
docker compose up -d
pip install flask opentelemetry-sdk opentelemetry-exporter-otlp-proto-grpc
python solutions/app.py &
curl http://localhost:5000/
open http://localhost:16686  # Services dropdown should show "devops-app"
```
