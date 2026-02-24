# Solution — Blue-Green Deployments

## Fixes Applied

### Fix 1 & 2: Green Service selector

```yaml
# Before (service-green.yaml)
spec:
  selector:
    app: devops-app       # selects ALL devops-app pods — same as blue!

# After
spec:
  selector:
    app: devops-app
    version: green        # only selects green pods
```

Both Services pointed to the same pods. Adding `version: green` makes the green Service route only to green pods.

### Fix 3: Version label on green pods

```yaml
# Before (deployment-green.yaml template labels)
labels:
  app: devops-app
  # missing version label!

# After
labels:
  app: devops-app
  version: green
```

The `matchLabels` selector required `version: green` but the pod template didn't have that label — causing the Deployment to have 0 available pods and the Service selector to never match.

### Fix 4: ReadinessProbe on green

```yaml
# After (deployment-green.yaml)
readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

Without a readinessProbe, Kubernetes marks pods as Ready immediately after the container starts — before the app has actually initialized. The switch script would cut traffic to unready pods.

### Fix 5: Correct label key in switch.sh

```bash
# Before
kubectl patch service devops-app-production \
  -p "{\"spec\":{\"selector\":{\"color\":\"${TARGET}\"}}}"

# After
kubectl patch service devops-app-production \
  -p "{\"spec\":{\"selector\":{\"version\":\"${TARGET}\"}}}"
```

The label key on pods is `version`, not `color`. Using the wrong key means the Service selector never matches any pods.

---

## Result

- Green Service exclusively routes to `version: green` pods
- Green pods must pass readiness checks before receiving traffic
- `./switch.sh green` atomically switches production traffic to green
- Blue pods remain running — rollback is instant with `./switch.sh blue`
