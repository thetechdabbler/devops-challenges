# Resources — SLOs and Error Budgets

## SLO Concepts

| Term | Definition |
|------|-----------|
| SLI | Service Level Indicator — the metric (e.g. error rate) |
| SLO | Service Level Objective — the target (e.g. 99.9% availability) |
| Error Budget | `1 - SLO` = allowed failure budget (e.g. 0.1%) |
| Burn Rate | How fast the error budget is being consumed |

## Recording Rule Convention

```yaml
# Format: job:metric:ratio_rateWINDOW
- record: job:http_requests:error_ratio_rate5m
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
    /
    sum(rate(http_requests_total[5m]))
  labels:
    job: my-app
    slo: availability
```

## Multi-Window Burn Rate Alerts

```yaml
# Fast burn: exhausts budget in < 1h (14.4x burn rate)
- alert: HighBurnRate
  expr: |
    job:http_requests:error_ratio_rate1h > (14.4 * 0.001)
    and
    job:http_requests:error_ratio_rate5m > (14.4 * 0.001)
  for: 2m
  labels:
    severity: critical

# Slow burn: exhausts budget in < 3d (1x burn rate)
- alert: LowBurnRate
  expr: |
    job:http_requests:error_ratio_rate6h > (1 * 0.001)
    and
    job:http_requests:error_ratio_rate30m > (1 * 0.001)
  for: 60m
  labels:
    severity: warning
```

## Official Docs

- [Google SRE Book — SLOs](https://sre.google/sre-book/service-level-objectives/)
- [Prometheus recording rules](https://prometheus.io/docs/practices/rules/)
- [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [Sloth — SLO generator](https://sloth.dev/)
