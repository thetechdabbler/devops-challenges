# Exercise 08 — Log Aggregation with ELK

Fix Filebeat and Kibana configurations so application logs are shipped to Elasticsearch and visible in Kibana.

## Quick Start

```bash
docker compose up -d
open http://localhost:5601   # Kibana UI
# Management > Index Patterns > filebeat-*
```

## Files

```
starter/
  filebeat.yml         — Filebeat config (4 bugs)
  docker-compose.yml   — ELK stack (1 bug)
solutions/
  filebeat.yml
  docker-compose.yml
  step-by-step-solution.md
```
