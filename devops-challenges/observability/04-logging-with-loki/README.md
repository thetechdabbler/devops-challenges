# Exercise 04 — Logging with Loki

Fix Promtail and Loki configurations so application logs are collected, labelled, and queryable in Grafana.

## Quick Start

```bash
docker compose up -d
open http://localhost:3000   # Explore > Loki > {job="devops-app"}
```

## Files

```
starter/
  promtail.yml       — Promtail config (4 bugs)
  loki.yml           — Loki config (1 bug)
  docker-compose.yml
solutions/
  promtail.yml
  loki.yml
  step-by-step-solution.md
```
