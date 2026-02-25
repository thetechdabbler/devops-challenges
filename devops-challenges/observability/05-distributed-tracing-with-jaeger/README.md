# Exercise 05 — Distributed Tracing with Jaeger

Fix a Python Flask app's OpenTelemetry tracing setup and Jaeger Docker Compose configuration so traces appear in the Jaeger UI.

## Quick Start

```bash
docker compose up -d
python starter/app.py &
curl http://localhost:5000/
open http://localhost:16686   # Jaeger UI
```

## Files

```
starter/
  app.py             — Flask app with OTEL tracing (4 bugs)
  docker-compose.yml — Jaeger stack (1 bug)
solutions/
  app.py
  docker-compose.yml
  step-by-step-solution.md
```
