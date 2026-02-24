# 08 — Manual Approvals and Environments

**Level**: Advanced | **Topic**: CI

Add a human approval gate before production deployments using GitHub Environments with required reviewers. Four issues to fix.

## Prerequisites

- Admin access to your GitHub repository (to create environments)
- Settings → Environments → create `staging` and `production` environments
- Add yourself as a required reviewer on `production`

## Quick Start

```bash
cp starter/ci.yml .github/workflows/deploy.yml
# Set up environments in GitHub Settings first
# Fix the 4 issues and push to main
# Watch the Actions tab — deploy-prod should pause for approval
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/08-manual-approvals-and-environments/`](../../../solutions/ci/08-manual-approvals-and-environments/)
