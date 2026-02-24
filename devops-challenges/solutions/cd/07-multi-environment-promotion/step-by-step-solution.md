# Solution — Multi-Environment Promotion

## Fixes Applied

### Fix 1: Sequential `needs:` dependencies

```yaml
deploy-dev:
  needs: test

deploy-staging:
  needs: deploy-dev    # ← can't run until dev succeeds

deploy-prod:
  needs: deploy-staging
```

Without `needs:`, all three deploy jobs start simultaneously. Dev might fail while staging and prod are already in progress.

### Fix 2: Add `environment: production` for approval gate

```yaml
deploy-prod:
  needs: deploy-staging
  environment: production    # ← pauses until a reviewer approves
```

GitHub Environments with required reviewers pause the job until an authorized person clicks "Approve" in the UI. Configure this under **Settings → Environments → production**.

### Fix 3: Dev must `needs: test`

```yaml
deploy-dev:
  needs: test    # ← dev only deploys after tests pass
```

Without this, broken code gets deployed to dev immediately, defeating the purpose of the test job.

### Fix 4: Pin version with workflow-level env var

```yaml
env:
  IMAGE_TAG: ${{ github.sha }}

# All jobs use ${{ env.IMAGE_TAG }}
```

Each job using `${{ github.sha }}` re-evaluates it — while the SHA itself is stable, using a workflow-level env var makes the intent explicit and makes it easy to swap in a semver tag or a build output.

### Fix 5: Add `workflow_dispatch` for manual promotion

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [dev, staging, production]
```

This lets on-call engineers trigger a specific environment promotion via `gh workflow run` or the GitHub UI without pushing a new commit.

---

## Result

- Tests must pass before dev gets a deployment
- Dev must succeed before staging, staging before prod
- Production requires manual approval from a team reviewer
- All three environments deploy the exact same image SHA
