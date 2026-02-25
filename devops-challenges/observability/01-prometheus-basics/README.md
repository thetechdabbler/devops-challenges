# Exercise 01 — Prometheus Basics

Fix a Prometheus scrape configuration that targets Node Exporter and a custom application.

## Quick Start

```bash
docker compose up -d
# Check config validity
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
# Open Prometheus UI
open http://localhost:9090
```

## Files

```
starter/
  prometheus.yml       — scrape config (5 bugs)
  docker-compose.yml   — Prometheus + Node Exporter stack
solutions/
  prometheus.yml       — fixed config
  step-by-step-solution.md
```
