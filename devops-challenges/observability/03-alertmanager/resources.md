# Resources — Alertmanager

## Alertmanager Config

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: default
  group_by: [alertname, job]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  routes:
    - matchers:
        - severity = "critical"
      receiver: pagerduty
      continue: false

receivers:
  - name: default
    slack_configs:
      - slack_api_url: "https://hooks.slack.com/..."
        channel: "#alerts"
        title: "{{ .GroupLabels.alertname }}"

  - name: pagerduty
    pagerduty_configs:
      - routing_key: "{{ .ExternalURL }}"
```

## Alert Rules

```yaml
groups:
  - name: app-alerts
    interval: 1m
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.job }}"
```

## Validation Commands

```bash
amtool check-config alertmanager.yml
amtool config routes test --config.file=alertmanager.yml severity=critical
promtool check rules rules.yml
```

## Official Docs

- [Alertmanager configuration](https://prometheus.io/docs/alerting/latest/configuration/)
- [Routing tree](https://prometheus.io/docs/alerting/latest/configuration/#route)
- [Alert rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
