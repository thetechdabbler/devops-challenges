from flask import Flask
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME

# FIX 5: add Resource with service.name
resource = Resource(attributes={SERVICE_NAME: "devops-app"})
provider = TracerProvider(resource=resource)

exporter = OTLPSpanExporter(
    endpoint="jaeger:4317",   # FIX 1: gRPC endpoint without http:// scheme
    insecure=True,
)
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

@app.route("/")
def index():
    with tracer.start_as_current_span(       # FIX 4: context manager form
        "handle-request",
        kind=trace.SpanKind.SERVER,          # FIX 2: SERVER for incoming HTTP
    ) as span:
        span.set_attribute("http.method", "GET")
        result = {"message": "Hello, traces!"}
    return result

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
