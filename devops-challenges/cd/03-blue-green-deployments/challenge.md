# Challenge — Blue-Green Deployments

## Scenario

Your team wants zero-downtime deployments using a blue-green strategy. The blue deployment is live in production. A colleague set up the green Deployment and Services, but traffic is still going to blue even after the switch script runs — and the green pods aren't properly health-checked before traffic is cut over.

Fix the Kubernetes manifests so blue-green works correctly.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Both Services use the same selector** — `service-blue.yaml` and `service-green.yaml` both point to `app: devops-app`, so they serve the same pods
2. **Service selectors lack `version` label** — switching traffic requires selecting on `version: blue` vs `version: green`
3. **Green Deployment missing `version` label** — pods don't have the label that Services need to select
4. **No readinessProbe on green** — traffic can be routed to green before pods are actually ready
5. **Traffic switch script is broken** — `switch.sh` patches the wrong label key

## Acceptance Criteria

- [ ] Blue Service routes only to blue pods (label `version: blue`)
- [ ] Green Service routes only to green pods (label `version: green`)
- [ ] Green pods pass readiness checks before `switch.sh` runs
- [ ] Running `switch.sh` atomically switches the production Service to green
- [ ] Blue pods remain running after the switch (instant rollback possible)

## Learning Notes

**Blue-green selector pattern:**
```yaml
# production-service.yaml — points to active color
spec:
  selector:
    app: devops-app
    version: blue    # ← change this to switch traffic
```

**Readiness before cutover:**
Always ensure green is healthy before switching. Use `kubectl rollout status` or wait for the Service endpoints to populate:
```bash
kubectl get endpoints devops-app-green
```

**Zero-downtime switch:**
```bash
kubectl patch service devops-app-production \
  -p '{"spec":{"selector":{"version":"green"}}}'
```
