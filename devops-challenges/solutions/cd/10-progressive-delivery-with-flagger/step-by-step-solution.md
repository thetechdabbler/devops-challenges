# Solution — Progressive Delivery with Flagger

## Fixes Applied

### Fix 1: Add `provider: nginx`

```yaml
spec:
  provider: nginx
```

Without `provider`, Flagger doesn't know which ingress controller or service mesh is managing traffic. Flagger supports nginx, istio, linkerd, aws-app-mesh, traefik, and more. Each uses different traffic-splitting mechanisms.

### Fix 2: Set `stepWeight: 10`

```yaml
analysis:
  stepWeight: 10    # 10% traffic per step
```

`stepWeight: 0` means no traffic ever goes to the canary — it can never be evaluated. Setting it to 10 means each successful analysis interval shifts 10% more traffic to the canary.

### Fix 3: Set `threshold: 5`

```yaml
analysis:
  threshold: 5    # 5 consecutive failures before abort
```

`threshold: 0` means the very first metric sample below the success condition triggers a rollback — even transient spikes from unrelated traffic. Setting 5 tolerates brief anomalies.

### Fix 4: Add `metrics` block

```yaml
metrics:
  - name: request-success-rate
    thresholdRange:
      min: 99      # require 99% success rate
    interval: 1m
  - name: request-duration
    thresholdRange:
      max: 500     # fail if p99 latency > 500ms
    interval: 1m
```

Without metrics, Flagger has no success criteria — it can't decide whether to promote or rollback. These built-in Flagger metrics query Prometheus automatically.

### Fix 5: Set `interval: 1m`

```yaml
analysis:
  interval: 1m
```

Prometheus scrapes metrics every 15-30 seconds. A 5s analysis interval means Flagger queries data that hasn't been refreshed yet — it would see the same stale sample repeatedly. `1m` gives Prometheus time to collect meaningful data at each traffic step.

---

## Result

- Flagger routes traffic through nginx ingress
- Canary starts at 10%, increments to 50% over 4 steps
- Each step is evaluated for 1 minute against success rate and latency
- Up to 5 consecutive failures are tolerated before rollback
- Successful analysis automatically promotes the canary to primary
