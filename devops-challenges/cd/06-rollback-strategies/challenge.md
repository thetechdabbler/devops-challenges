# Challenge — Rollback Strategies

## Scenario

Production is down. `devops-app:1.3.0` was deployed 10 minutes ago and the error rate spiked to 40%. You need to roll back — fast.

The GitHub Actions workflow has a rollback step, but it's broken in multiple ways: it doesn't trigger on failure, uses a hardcoded wrong deployment name, and doesn't verify the rollback actually worked.

Fix the workflow so rollbacks are automatic, verified, and notify the team.

## Your Task

The file `starter/cd.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Rollback step missing `if: failure()`** — rollback runs on every deploy, not just failures
2. **Wrong deployment name** — `kubectl rollout undo deployment/app` (hardcoded "app") should use the actual deployment name
3. **No rollback verification** — `kubectl rollout status` is not called after undo
4. **Missing notification on rollback** — team doesn't know a rollback happened
5. **Rollback not in a separate job** — rollback is a step inside deploy, so a deploy crash before it may skip it

## Acceptance Criteria

- [ ] Rollback triggers automatically when the deploy step fails
- [ ] `kubectl rollout undo deployment/devops-app` is called with the correct name
- [ ] `kubectl rollout status` confirms rollback completed
- [ ] Slack alert is sent when a rollback occurs
- [ ] Rollback logic is isolated in its own job with `needs: deploy` and `if: failure()`

## Learning Notes

**kubectl rollout commands:**
```bash
# Roll back to previous version
kubectl rollout undo deployment/devops-app -n prod

# Roll back to a specific revision
kubectl rollout undo deployment/devops-app --to-revision=3 -n prod

# Check rollout history
kubectl rollout history deployment/devops-app -n prod

# Wait for rollback to complete
kubectl rollout status deployment/devops-app -n prod --timeout=2m
```

**Rollback job pattern:**
```yaml
rollback:
  needs: deploy
  if: failure()
  runs-on: ubuntu-latest
  steps:
    - name: Rollback
      run: |
        kubectl rollout undo deployment/$APP_NAME -n prod
        kubectl rollout status deployment/$APP_NAME -n prod --timeout=2m
```
