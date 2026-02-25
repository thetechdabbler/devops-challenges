# Step-by-Step Solution — Prometheus Basics

## Bug 1 — `scrape_interval` missing unit

Prometheus duration strings require a unit suffix. `15` is invalid; `15s` means 15 seconds.

```yaml
# Wrong
scrape_interval: 15

# Fixed
scrape_interval: 15s
```

## Bug 2 — `metrics_path: /metric` (missing plural s)

The standard Prometheus metrics endpoint is `/metrics`. `/metric` returns a 404.

```yaml
metrics_path: /metrics
```

## Bug 3 — Target must be a list

`static_configs.targets` is always a YAML list, even with a single item.

```yaml
# Wrong
targets: "localhost:9100"

# Fixed
targets: ["localhost:9100"]
```

## Bug 4 — Duplicate `job_name: "prometheus"`

Each job must have a unique name. Having two `"prometheus"` jobs causes Prometheus to reject the config or silently overwrite one.

```yaml
# Wrong
job_name: "prometheus"  # second job

# Fixed
job_name: "node"
```

## Bug 5 — `honor_labels` misplaced under `static_configs`

`honor_labels` is a job-level field, not a label key inside `static_configs`. Placing it under `static_configs` makes Prometheus treat it as a label named `honor_labels` with value `true`.

```yaml
# Wrong
static_configs:
  - targets: [...]
    honor_labels: true

# Fixed
honor_labels: true
static_configs:
  - targets: [...]
```

## Verify

```bash
docker compose up -d
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
# Open http://localhost:9090/targets — both targets should show "UP"
```
