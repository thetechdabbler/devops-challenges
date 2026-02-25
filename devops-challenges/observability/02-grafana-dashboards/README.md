# Exercise 02 — Grafana Dashboards

Fix Grafana provisioning files so the datasource and dashboard load automatically on startup.

## Quick Start

```bash
docker compose up -d
open http://localhost:3000   # admin / admin
```

## Files

```
starter/
  grafana/
    provisioning/
      datasources/prometheus.yml   — datasource config (3 bugs)
    dashboards/overview.json       — dashboard JSON (2 bugs)
  docker-compose.yml
solutions/
  grafana/...                      — fixed files
  step-by-step-solution.md
```
