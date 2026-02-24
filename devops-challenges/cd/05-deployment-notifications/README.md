# Exercise 05 — Deployment Notifications

Fix a CD pipeline that sends Slack notifications on deployment failure — currently it's insecure, fires at the wrong time, and crashes the pipeline.

## Quick Start

```bash
# Set the webhook secret in GitHub
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/services/..."

# Test the workflow
gh workflow run cd.yml
```

## Files

- `starter/cd.yml` — broken notification workflow (5 bugs)
- `solutions/cd.yml` — working workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
