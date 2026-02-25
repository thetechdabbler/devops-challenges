# Step-by-Step Solution — Alertmanager

## Bug 1 — `match` should be `matchers`

The `match` map syntax was deprecated in Alertmanager v0.22. Use `matchers` (a list of label matchers) instead.

```yaml
# Wrong
match:
  severity: critical

# Fixed
matchers:
  - severity = "critical"
```

## Bug 2 — Receiver name mismatch

The default route sends to `"slack"` but the receiver is defined as `"slack-notifications"`. Names must match exactly (case-sensitive).

```yaml
# Wrong
receiver: "slack"

# Fixed
receiver: "slack-notifications"
```

## Bug 3 — `api_url` should be `slack_api_url`

The Slack config field for the incoming webhook URL is `slack_api_url`.

```yaml
# Wrong
api_url: "https://..."

# Fixed
slack_api_url: "https://..."
```

## Bug 4 — `=` instead of `>` in PromQL expression

`=` is label matching in PromQL selectors. For numeric comparison in alert expressions, use `>`, `<`, `>=`, `<=`, `==`, or `!=`.

```yaml
# Wrong
expr: rate(http_requests_total{status=~"5.."}[5m]) = 0.05

# Fixed
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
```

## Bug 5 — `for` duration missing unit

Prometheus duration strings require a unit. `5` is invalid; `5m` means 5 minutes.

```yaml
# Wrong
for: 5

# Fixed
for: 5m
```

## Verify

```bash
docker compose exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
docker compose exec prometheus promtool check rules /etc/prometheus/rules.yml
```
