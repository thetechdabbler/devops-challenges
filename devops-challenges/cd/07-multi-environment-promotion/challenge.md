# Challenge — Multi-Environment Promotion

## Scenario

Your team promotes releases through three environments: `dev` → `staging` → `production`. A colleague set up a GitHub Actions workflow, but all three environments deploy in parallel on every push, there's no human approval gate for production, and the image version isn't pinned between environments (dev gets a different SHA than what actually gets tested in staging).

Fix the workflow so promotions are sequential, gated, and use a pinned version throughout.

## Your Task

The file `starter/cd.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **All envs deploy in parallel** — missing `needs:` dependencies between jobs
2. **No approval gate for production** — missing `environment: production` (no required reviewers)
3. **Dev deploy missing `needs: test`** — dev can deploy even if tests fail
4. **Version not pinned** — each env re-resolves `github.sha` independently (should all use the same tag)
5. **No `workflow_dispatch` input** — cannot manually promote to a specific environment

## Acceptance Criteria

- [ ] Dev deploys after tests pass
- [ ] Staging deploys after dev succeeds
- [ ] Production requires manual approval (GitHub Environment protection rule)
- [ ] All three environments deploy the exact same image tag
- [ ] A `workflow_dispatch` input lets you manually trigger promotion to any environment

## Learning Notes

**Sequential promotion pattern:**
```yaml
deploy-dev:
  needs: test
  ...

deploy-staging:
  needs: deploy-dev
  ...

deploy-prod:
  needs: deploy-staging
  environment: production    # ← triggers required reviewers
  ...
```

**Pinning the version across environments:**
```yaml
# Use a workflow-level env var or pass as job output
env:
  IMAGE_TAG: ${{ github.sha }}

# Or use job outputs to pass between jobs
outputs:
  image-tag: ${{ steps.tag.outputs.tag }}
```
