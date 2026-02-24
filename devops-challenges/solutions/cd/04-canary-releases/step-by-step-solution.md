# Solution — Canary Releases

## Fixes Applied

### Fix 1: Add canary steps

```yaml
# Before
steps: []

# After
steps:
  - setWeight: 10
  - pause: {duration: 2m}
  - analysis:
      templates:
        - templateName: success-rate
  - setWeight: 50
  - pause: {duration: 2m}
  - setWeight: 100
```

Without steps, the rollout immediately jumps to 100% with no gradual traffic shift.

### Fix 2: Fix `maxSurge`

```yaml
# Before
maxSurge: 0

# After
maxSurge: "25%"
```

`maxSurge: 0` means Kubernetes cannot create new pods during the rollout — nothing can progress. Setting it to `"25%"` allows 1 extra pod per replica group to be created during the canary phase.

### Fix 3: `pauseDuration` via pause steps

Added `pause: {duration: 2m}` between weight steps. This gives time for metrics to stabilize at each traffic level before proceeding.

### Fix 4: Analysis step added

The `analysis` step in the middle of the progression runs the `success-rate` AnalysisTemplate before promoting beyond 10%. If it fails 3 times, the rollout is automatically aborted and rolled back.

### Fix 5: Create AnalysisTemplate

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  metrics:
    - name: success-rate
      interval: 1m
      failureLimit: 3
      provider:
        prometheus:
          query: |
            sum(rate(http_requests_total{status!~"5.."}[5m])) /
            sum(rate(http_requests_total[5m]))
      successCondition: result[0] >= 0.95
```

---

## Result

- Rollout starts at 10% canary traffic
- Pauses 2 minutes, then runs success-rate analysis
- If error rate < 5%, promotes to 50%, pauses, then 100%
- If error rate > 5% three times in a row, auto-aborts and reverts
