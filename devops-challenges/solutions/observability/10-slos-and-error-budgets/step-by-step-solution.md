# Step-by-Step Solution — SLOs and Error Budgets

## Bug 1 — Wrong recording rule naming convention

The community standard for SLO recording rules is `job:metric:ratio_rateWINDOW`. Consistent naming lets tooling (Sloth, Pyrra, dashboards) auto-discover your SLO rules.

```yaml
# Wrong
record: slo_error_rate_5m

# Fixed
record: job:http_requests:error_ratio_rate5m
```

## Bug 2 — Burn rate fast-window uses 720h (30d)

A "fast burn" alert is designed to catch errors that will exhaust the budget within 1 hour. Using a 720-hour window defeats the purpose — you'd never get a timely alert.

```yaml
# Wrong — 30-day window in a fast burn alert
sum(rate(http_requests_total{status=~"5.."}[720h]))

# Fixed — reference the 5m recording rule
job:http_requests:error_ratio_rate5m > (14.4 * 0.001)
```

## Bug 3 — Error budget formula inverted

The error budget is `1 - SLO_target`. For a 99.9% SLO: `1 - 0.999 = 0.001` (0.1%). The starter had `0.999 - 1 = -0.001`, a negative number that makes no sense.

```yaml
# Wrong
expr: 0.999 - 1

# Fixed
expr: 1 - 0.999
```

## Bug 4 — `for: 1h` too long for fast-burn alert

The purpose of multi-window burn rate alerting is rapid detection. A fast-burn alert should fire after 2 minutes of sustained high burn rate, not 1 hour.

```yaml
# Wrong
for: 1h

# Fixed
for: 2m
```

## Bug 5 — Recording rules missing `labels` block

Without labels, you cannot filter recording rules by `slo` or `job` in dashboards and alert queries.

```yaml
labels:
  job: my-app
  slo: availability
```

## Verify

```bash
promtool check rules solutions/slo-rules.yml
docker compose up -d
# In Prometheus: query job:http_requests:error_ratio_rate5m
```
