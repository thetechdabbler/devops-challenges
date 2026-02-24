# Solution — Deployment Notifications

## Fixes Applied

### Fix 1: Add `if: failure()` condition

```yaml
# Before: job-level (always runs)
notify:
  runs-on: ubuntu-latest

# After
notify-on-failure:
  needs: deploy
  if: failure()
```

Without `if: failure()`, the notify job runs on every push — even successful ones. `failure()` evaluates to true only when a job in the `needs` list failed.

### Fix 2: Use secret for webhook URL

```yaml
# Before
env:
  SLACK_WEBHOOK: "https://hooks.slack.com/services/T00000/..."

# After (in step)
run: curl -X POST "${{ secrets.SLACK_WEBHOOK }}" ...
```

Hardcoded URLs appear in workflow YAML committed to Git and in workflow logs. Store the webhook as a GitHub Secret and reference it with `secrets.SLACK_WEBHOOK`.

### Fix 3: Include status context in message

```json
{
  "text": ":red_circle: *Deploy Failed*",
  "attachments": [{
    "color": "danger",
    "fields": [
      {"title": "Branch", "value": "${{ github.ref_name }}"},
      {"title": "Commit", "value": "${{ github.sha }}"},
      {"title": "Run", "value": "<URL|View Run>"}
    ]
  }]
}
```

A bare "Deployment finished" message is useless. Include repo, branch, commit SHA, and a link to the Actions run.

### Fix 4: Add `needs: deploy`

```yaml
notify-on-failure:
  needs: deploy    # ← wait for deploy to finish
  if: failure()
```

Without `needs`, notify runs in parallel with deploy — before the deploy outcome is known. `needs: deploy` makes it wait for the deploy result.

### Fix 5: Add `continue-on-error: true`

```yaml
- name: Send Slack failure alert
  run: curl ...
  continue-on-error: true
```

If the Slack webhook returns an error (expired URL, rate limit), the step fails and blocks future pipeline runs. `continue-on-error: true` marks notifications as best-effort.

---

## Result

- Slack alert fires only when deploy fails
- Webhook URL is encrypted in GitHub Secrets
- Message includes actionable context (branch, SHA, run link)
- A broken Slack integration doesn't block the CD pipeline
