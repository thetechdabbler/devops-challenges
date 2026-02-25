# Challenge — SLOs and Error Budgets

## Scenario

Your team defines SLOs (Service Level Objectives) using Prometheus recording rules and burn rate alerts. A colleague wrote the SLO recording rules and multi-window burn rate alerts but got the recording rule names wrong, used invalid window sizes, and broke the error budget calculation.

Fix the rules so the SLO is correctly tracked and the burn rate alert fires when the error budget is being consumed too fast.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Recording rule name format wrong** — SLO recording rules should follow the naming convention `job:metric:ratio_rate5m` — the starter uses `slo_error_rate` which won't be recognized by standard SLO tooling
2. **Burn rate window too large** — `rate(http_requests_total[720h])` uses a 30-day window for a fast burn alert; fast burn should use `1h` and `5m` windows
3. **Error budget formula inverted** — `1 - 0.999` calculates the error budget correctly (0.001) but the starter uses `0.999 - 1` which gives a negative number
4. **`for` on multi-window alert too long** — a burn rate alert with `for: 1h` delays paging; it should be `for: 2m` for the fast-burn window
5. **Missing `labels` block on recording rule** — SLO recording rules need a `labels` block with `job` and `slo` so they can be filtered in dashboards

## Acceptance Criteria

- [ ] `promtool check rules slo-rules.yml` passes
- [ ] Recording rule name follows `job:metric:ratio_rateXm` convention
- [ ] Fast burn rate window uses `1h` and `5m`
- [ ] Error budget is `1 - slo_target` (positive number)
- [ ] Burn rate alert `for` is `2m`
- [ ] Recording rules have `labels: { slo: availability }`

## Learning Notes

**SLO recording rule pattern:**
```yaml
groups:
  - name: slo-rules
    rules:
      # Error ratio over time window
      - record: job:http_requests:error_ratio_rate5m
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          /
          sum(rate(http_requests_total[5m]))
        labels:
          job: my-app
          slo: availability

      # Burn rate alert (fast window)
      - alert: HighBurnRate
        expr: |
          job:http_requests:error_ratio_rate1h > (14.4 * 0.001)
          and
          job:http_requests:error_ratio_rate5m > (14.4 * 0.001)
        for: 2m
        labels:
          severity: critical
          slo: availability
        annotations:
          summary: "SLO burn rate too high — exhausting budget in < 1h"
```
