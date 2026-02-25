# Exercise 03 — Alertmanager

Fix Alertmanager routing configuration and Prometheus alert rules so alerts reach the correct receivers.

## Quick Start

```bash
docker compose up -d
# Check configs
docker compose exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
docker compose exec prometheus promtool check rules /etc/prometheus/rules.yml
```

## Files

```
starter/
  alertmanager.yml     — routing config (3 bugs)
  rules.yml            — Prometheus alert rules (2 bugs)
  docker-compose.yml
solutions/
  alertmanager.yml
  rules.yml
  step-by-step-solution.md
```
