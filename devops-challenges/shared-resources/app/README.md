# DevOps Sample App

A minimal Python Flask web application used as the subject for all exercises in this repo. Every topic — Docker, Kubernetes, CI/CD, Ansible, IaC, Observability, AWS — uses this same app.

---

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Returns app name, version, environment |
| `GET /health` | Liveness check — returns `{"status": "healthy"}` |
| `GET /ready` | Readiness check — returns `{"status": "ready"}` |
| `GET /info` | App info including uptime |
| `GET /simulate/error` | Returns 500 — useful for alerting exercises |
| `GET /simulate/slow` | Delays response — useful for latency/tracing exercises |

---

## Run Locally

```bash
pip install -r requirements.txt
python app.py
```

App starts on `http://localhost:5000`.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_VERSION` | `1.0.0` | Reported in `/` and `/info` responses |
| `APP_ENV` | `development` | Environment name (development, staging, production) |
| `PORT` | `5000` | Port to listen on |
| `SLOW_DELAY` | `2.0` | Seconds to delay `/simulate/slow` response |

---

## Used In

| Topic | How |
|-------|-----|
| Docker | Containerize this app, optimize the image, harden it |
| Kubernetes | Deploy it as a Pod/Deployment, add probes, configure Ingress |
| CI | Build and test it in a pipeline, push the image to a registry |
| CD | Deploy it automatically across environments |
| Ansible | Configure the server it runs on |
| IaC | Provision the infrastructure it runs on |
| Observability | Instrument it with metrics, traces, and structured logs |
| AWS | Deploy it to ECS Fargate, Lambda, or EC2 |
