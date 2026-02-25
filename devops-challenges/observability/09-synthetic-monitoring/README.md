# Exercise 09 — Synthetic Monitoring

Fix Blackbox Exporter and Prometheus configurations to probe HTTP endpoints and track uptime.

## Quick Start

```bash
docker compose up -d
# Test a probe manually
curl "http://localhost:9115/probe?target=http://example.com&module=http_2xx"
open http://localhost:9090/targets
```

## Files

```
starter/
  blackbox.yml         — Blackbox Exporter config (2 bugs)
  prometheus.yml       — Prometheus scrape config (3 bugs)
  docker-compose.yml
solutions/
  blackbox.yml
  prometheus.yml
  step-by-step-solution.md
```
