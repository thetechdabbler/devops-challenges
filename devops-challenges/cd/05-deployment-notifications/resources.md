# Resources — Deployment Notifications

## GitHub Actions Status Functions

```yaml
if: success()    # only when all needed jobs passed
if: failure()    # only when a needed job failed
if: always()     # regardless of outcome
if: cancelled()  # only when the workflow was cancelled
```

## Slack Incoming Webhook Payload

```json
{
  "text": ":white_check_mark: Deploy succeeded!",
  "attachments": [
    {
      "color": "good",
      "fields": [
        {"title": "Branch", "value": "main", "short": true},
        {"title": "Commit", "value": "abc1234", "short": true}
      ]
    }
  ]
}
```

## GitHub Context Variables

```yaml
${{ github.run_id }}          # workflow run ID
${{ github.run_number }}      # sequential run number
${{ github.ref_name }}        # branch or tag name
${{ github.sha }}             # full commit SHA
${{ github.actor }}           # who triggered the run
${{ github.server_url }}      # https://github.com
${{ github.repository }}      # org/repo
```

## Full Notification Step Pattern

```yaml
- name: Notify Slack
  if: failure()
  run: |
    curl -s -X POST "${{ secrets.SLACK_WEBHOOK }}" \
      -H 'Content-type: application/json' \
      -d '{
        "text": ":red_circle: *Deploy Failed*",
        "attachments": [{
          "color": "danger",
          "fields": [
            {"title": "Repo", "value": "${{ github.repository }}", "short": true},
            {"title": "Branch", "value": "${{ github.ref_name }}", "short": true},
            {"title": "Commit", "value": "${{ github.sha }}", "short": true},
            {"title": "Run", "value": "<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>", "short": true}
          ]
        }]
      }'
  continue-on-error: true
```

## Official Docs

- [GitHub Actions expressions](https://docs.github.com/en/actions/learn-github-actions/expressions)
- [Job conditions](https://docs.github.com/en/actions/using-jobs/using-conditions-to-control-job-execution)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
