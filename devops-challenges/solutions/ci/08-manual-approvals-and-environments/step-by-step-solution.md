# Solution — Manual Approvals and Environments

## Fixes Applied

### Fix 1 & 2: environment: production

```yaml
deploy-prod:
  environment:
    name: production
    url: ${{ vars.PROD_URL }}
```

When a job references an environment that has **Required reviewers** configured, GitHub pauses the job and sends approval requests. The job only proceeds after an authorized reviewer clicks "Approve and deploy."

Without `environment: production`, the job runs immediately regardless of any protection rules configured in GitHub Settings.

### Fix 3: URL from environment variable

```yaml
environment:
  url: ${{ vars.PROD_URL }}   # shown as a clickable link in Actions UI
```

Set `PROD_URL` in **Settings → Environments → production → Variables**.

This also makes the workflow portable — changing the URL requires no code change.

### Fix 4: Concurrency group

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

Without concurrency control, two simultaneous pushes to `main` could both run `deploy-prod` simultaneously. `cancel-in-progress: false` ensures the second run waits for the first to finish (rather than cancelling it mid-deployment, which could leave production in an inconsistent state).

---

## Deployment Flow

```
push to main
  → test (auto)
  → deploy-staging (auto, after test)
  → deploy-prod (PAUSED — waiting for approval)
       Reviewer receives email/notification
       → Approve → deployment continues
       → Reject  → deployment cancelled
```
