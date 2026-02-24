# Challenge — Progressive Delivery with Flagger

## Scenario

Your team uses Flagger with the nginx ingress mesh to automate canary promotions based on real traffic metrics. A colleague created a Flagger `Canary` resource for `devops-app`, but the canary never moves past 0% traffic and never gets promoted — or failed.

Fix the Flagger Canary manifest so progressive delivery works automatically.

## Your Task

The file `starter/canary.yaml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Missing `provider` field** — Flagger doesn't know which service mesh/ingress to use
2. **`stepWeight: 0`** — traffic never shifts to the canary
3. **`threshold: 0`** — metric failure threshold of 0 means the first bad data point aborts everything
4. **Missing `metrics` block** — no analysis is configured; Flagger can't evaluate success
5. **`interval: "5s"`** — too short; Prometheus doesn't have stable data over 5 seconds

## Acceptance Criteria

- [ ] Flagger uses `nginx` as its ingress provider
- [ ] Canary starts at 10% traffic and increments by 10% per step
- [ ] Metric failure threshold is 5 (tolerates transient errors)
- [ ] A `request-success-rate` metric is configured for promotion gating
- [ ] Analysis interval is at least `1m`

## Learning Notes

**Flagger Canary anatomy:**
```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
spec:
  provider: nginx           # nginx, istio, linkerd, appmesh, ...
  analysis:
    interval: 1m            # how often to check metrics
    threshold: 5            # failures before abort
    maxWeight: 50           # max traffic % to canary
    stepWeight: 10          # traffic % per step
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99
        interval: 1m
```

**Flagger lifecycle:**
1. Detect new Deployment image
2. Scale up canary pods
3. Route `stepWeight`% of traffic to canary
4. Evaluate metrics every `interval`
5. If metrics pass: increment traffic by `stepWeight`
6. If metrics fail `threshold` times: rollback
7. At `maxWeight`: promote (copy canary spec to primary)
