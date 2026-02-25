# Exercise 10 — SLOs and Error Budgets

Fix Prometheus recording rules and burn rate alert definitions to correctly track an SLO and its error budget.

## Quick Start

```bash
docker compose up -d
docker compose exec prometheus promtool check rules /etc/prometheus/slo-rules.yml
open http://localhost:9090
# Query: job:http_requests:error_ratio_rate5m
```

## Files

```
starter/
  slo-rules.yml        — SLO recording rules + alerts (5 bugs)
  docker-compose.yml
solutions/
  slo-rules.yml        — fixed rules
  step-by-step-solution.md
```
