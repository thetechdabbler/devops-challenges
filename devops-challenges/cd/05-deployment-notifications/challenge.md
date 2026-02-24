# Challenge — Deployment Notifications

## Scenario

Your team wants Slack notifications whenever a production deployment succeeds or fails. A colleague added notification steps to the GitHub Actions CD workflow, but:
- Notifications fire on every run even when the deploy succeeds (should only alert on failure)
- The webhook URL is hardcoded in the YAML file (security issue)
- The notification message doesn't include the deployment status
- The notification fires before the deploy step runs
- A broken notification crashes the entire pipeline

Fix the workflow so Slack notifications are secure, accurate, and non-blocking.

## Your Task

The file `starter/cd.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Notification always runs** — missing `if: failure()` condition (should only alert on failure)
2. **Webhook URL hardcoded** — `SLACK_WEBHOOK` is in plain YAML, not a secret
3. **Missing status in message** — notification payload doesn't include job status
4. **Wrong job dependency** — `notify` job runs in parallel with `deploy`, not after
5. **Missing `continue-on-error: true`** — a broken Slack notification fails the entire pipeline

## Acceptance Criteria

- [ ] Slack message is sent only when the deploy job fails
- [ ] Webhook URL is stored as `secrets.SLACK_WEBHOOK`
- [ ] Message includes job name, status, run URL, and commit SHA
- [ ] Notify job waits for deploy to complete before running
- [ ] A broken Slack hook does not fail the pipeline

## Learning Notes

**Conditional notification pattern:**
```yaml
notify-on-failure:
  needs: deploy
  if: failure()
  runs-on: ubuntu-latest
  steps:
    - name: Slack alert
      run: |
        curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
          -H 'Content-type: application/json' \
          -d '{
            "text": ":red_circle: Deploy failed on `${{ github.ref_name }}`",
            "attachments": [{
              "color": "danger",
              "text": "Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }]
          }'
      continue-on-error: true
```

**`if: failure()` vs `if: always()`:**
- `failure()` — runs only when a dependent job failed
- `always()` — runs regardless of outcome (use for audit logs)
- `success()` — runs only on success (default, rarely needed explicitly)
