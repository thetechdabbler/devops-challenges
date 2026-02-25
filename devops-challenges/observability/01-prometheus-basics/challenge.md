# Challenge — Prometheus Basics

## Scenario

Your team is setting up Prometheus to scrape metrics from a Node Exporter and a custom application. A colleague wrote the `prometheus.yml` scrape configuration but got the job names wrong, used the wrong metrics path, forgot the scrape interval unit, and broke the static target format.

Fix the Prometheus configuration so it successfully scrapes both targets.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong `scrape_interval` unit** — `scrape_interval: 15` is missing the unit — should be `15s`
2. **Wrong metrics path** — `metrics_path: /metric` should be `/metrics` (plural)
3. **Static configs target format wrong** — `targets: "localhost:9100"` should be a list `["localhost:9100"]`
4. **Duplicate `job_name`** — both jobs are named `"prometheus"` — the node exporter job should be `"node"`
5. **`honor_labels` misplaced** — `honor_labels: true` is indented under `static_configs` instead of the job level

## Acceptance Criteria

- [ ] `promtool check config prometheus.yml` passes
- [ ] `scrape_interval` uses a valid duration string (`15s`)
- [ ] `metrics_path` is `/metrics`
- [ ] Each job has a unique name
- [ ] Targets are lists

## Learning Notes

**Prometheus scrape config structure:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "node"
    metrics_path: /metrics
    honor_labels: true
    static_configs:
      - targets: ["localhost:9100"]
```

**Validate config:**
```bash
promtool check config prometheus.yml
docker run --rm -v $(pwd):/etc/prometheus prom/prometheus \
  promtool check config /etc/prometheus/prometheus.yml
```
