# Solution — Rollback Strategies

## Fixes Applied

### Fix 1: Add `if: failure()` to rollback job

```yaml
rollback:
  needs: deploy
  if: failure()
```

Rollback should only run when the deploy job fails. Without `if: failure()`, it runs after every successful deploy — undoing the very deployment you just made.

### Fix 2: Use correct deployment name

```bash
# Before
kubectl rollout undo deployment/app

# After
kubectl rollout undo deployment/$APP_NAME
```

The deployment is named `devops-app`, not `app`. Using `$APP_NAME` from the env block makes this maintainable.

### Fix 3: Verify rollback with `rollout status`

```bash
kubectl rollout undo deployment/$APP_NAME -n $NAMESPACE
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=3m
```

`kubectl rollout undo` is asynchronous — it submits the rollback but doesn't wait for it to complete. `rollout status` blocks until all pods are running the previous version (or fails the step if they don't).

### Fix 4: Add Slack notification on rollback

```yaml
- name: Notify rollback
  run: |
    curl -s -X POST "${{ secrets.SLACK_WEBHOOK }}" ...
  continue-on-error: true
```

Silent rollbacks are dangerous — the team needs to know production reverted. `continue-on-error: true` ensures a broken webhook doesn't prevent the rollback from being reported as done.

### Fix 5: Move rollback to a separate job

```yaml
# Before: rollback as a step inside deploy job
# After: rollback as an independent job with needs: deploy + if: failure()
```

A step inside a job is skipped if the job crashes mid-run. A separate job with `needs: [deploy]` and `if: failure()` is guaranteed to run whenever the deploy job fails, regardless of how it failed.

---

## Result

- Failed deploys trigger automatic rollback to the previous revision
- Rollback is verified with `rollout status` before reporting success
- Team is notified via Slack when a rollback occurs
- Rollback logic can't be accidentally skipped
