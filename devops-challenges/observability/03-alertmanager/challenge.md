# Challenge — Alertmanager

## Scenario

Your team uses Alertmanager to route Prometheus alerts to a Slack channel and page the on-call team via PagerDuty. A colleague wrote the Alertmanager config and the Prometheus alert rules but got the route `match` syntax wrong, used the wrong receiver name, and broke the Slack webhook field.

Fix both files so critical alerts page the on-call team and warnings go to Slack.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **`match` should be `matchers`** — in Alertmanager v0.22+, route matching uses `matchers` (list syntax), not the deprecated `match` map
2. **Receiver name mismatch** — the default route sends to `"slack"` but the receiver is named `"slack-notifications"` — names must match exactly
3. **Slack `api_url` should be `slack_api_url`** — the field for the Slack webhook URL in receiver config is `slack_api_url`
4. **Alert rule `expr` uses `=` instead of `==`** — PromQL comparison operators use `==`, not `=`
5. **`for` duration missing unit** — `for: 5` should be `for: 5m`

## Acceptance Criteria

- [ ] `amtool check-config alertmanager.yml` passes
- [ ] `promtool check rules rules.yml` passes
- [ ] Critical alerts route to `pagerduty` receiver
- [ ] Warning alerts route to `slack-notifications` receiver
- [ ] Slack config uses `slack_api_url`

## Learning Notes

**Alertmanager routing:**
```yaml
route:
  receiver: "slack-notifications"
  routes:
    - matchers:
        - severity = "critical"
      receiver: "pagerduty"

receivers:
  - name: "slack-notifications"
    slack_configs:
      - slack_api_url: "https://hooks.slack.com/services/..."
        channel: "#alerts"

  - name: "pagerduty"
    pagerduty_configs:
      - routing_key: "<key>"
```

**Prometheus alert rule:**
```yaml
groups:
  - name: app
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
```
