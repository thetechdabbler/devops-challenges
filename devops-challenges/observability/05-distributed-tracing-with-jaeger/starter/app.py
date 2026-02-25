from flask import Flask
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# BUG 5: No Resource with service.name — traces appear as "unknown_service" in Jaeger
provider = TracerProvider()

exporter = OTLPSpanExporter(
    endpoint="http://jaeger:4317",  # BUG 1: wrong scheme — gRPC endpoint should not use http://
    insecure=True,
)
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

@app.route("/")
def index():
    span = tracer.start_span(           # BUG 4: should be start_as_current_span context manager
        "handle-request",
        kind=trace.SpanKind.CLIENT,     # BUG 2: should be SERVER for incoming HTTP
    )
    result = {"message": "Hello, traces!"}
    span.end()
    return result

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
