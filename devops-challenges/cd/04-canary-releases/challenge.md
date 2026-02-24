# Challenge — Canary Releases

## Scenario

Your team uses Argo Rollouts to manage canary deployments. The new `devops-app:1.2.0` needs a gradual rollout — send 10% of traffic to the canary, wait for metrics to stabilize, then increment to 50%, then 100%.

A colleague created the Rollout manifest but the canary never progresses — it stays at 0% traffic forever and never promotes. Fix the manifest so canary releases work end-to-end.

## Your Task

The file `starter/rollout.yaml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **`steps` block is empty** — no canary weight progression defined
2. **`maxSurge: 0`** — no new pods can be created during the rollout
3. **Missing `pauseDuration`** — steps don't pause between weight increments
4. **No `analysis` reference** — no automated metrics check during rollout
5. **Missing `analysisTemplate`** — the template referenced in steps doesn't exist in `starter/`

## Acceptance Criteria

- [ ] Rollout starts at 10% canary traffic
- [ ] Rollout automatically pauses for 2 minutes between steps
- [ ] Rollout progresses through 10% → 50% → 100%
- [ ] An AnalysisTemplate checks error rate before promotion
- [ ] Failed analysis automatically aborts and rolls back

## Learning Notes

**Argo Rollouts canary steps:**
```yaml
strategy:
  canary:
    steps:
      - setWeight: 10        # 10% canary traffic
      - pause: {duration: 2m}
      - analysis:
          templates:
            - templateName: success-rate
      - setWeight: 50
      - pause: {duration: 2m}
      - setWeight: 100
```

**AnalysisTemplate:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  metrics:
    - name: success-rate
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{status!~"5.."}[5m])) /
            sum(rate(http_requests_total[5m]))
      successCondition: result[0] >= 0.95
      failureLimit: 3
```
