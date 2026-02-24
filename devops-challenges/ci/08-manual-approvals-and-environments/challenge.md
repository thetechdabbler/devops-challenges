# Challenge — Manual Approvals and Environments

## Scenario

Your CI pipeline deploys automatically to staging after tests pass — great. But it also deploys to production automatically without any human review. Last week, a passing-tests-but-broken-UX change went straight to prod. You need a manual approval gate before production deployments.

---

## Problems to Fix

The starter workflow has **four** issues:

1. The `deploy-prod` job runs automatically after `deploy-staging` — no approval required
2. The `environment: production` is set but no protection rules are configured in GitHub — explain how to add required reviewers
3. The deployment URL is hardcoded in the workflow — should come from the environment's variables
4. There is no `concurrency:` group — multiple simultaneous deployments can race and corrupt state

---

## Tasks

1. Create a `production` environment in GitHub with a required reviewer (yourself)
2. Add `environment: production` to the `deploy-prod` job
3. Move the production URL to the environment's variables
4. Add a `concurrency:` group to prevent concurrent deployments
5. Trigger a deployment and verify you receive an approval request email

---

## Acceptance Criteria

- [ ] `deploy-prod` job pauses with "Waiting for review" in the Actions UI
- [ ] Approving the deployment resumes the job
- [ ] Rejecting the deployment stops the job without deploying
- [ ] The deployment URL appears in the Actions UI next to the environment
- [ ] Two simultaneous workflow runs don't both deploy to production

---

## Learning Notes

### Creating a protected environment

1. Go to **Settings → Environments → New environment** → name it `production`
2. Check **Required reviewers** and add yourself
3. Optionally set a wait timer (e.g., 10 minutes after CI passes)
4. Click **Save protection rules**

### environment: in a job

```yaml
jobs:
  deploy-prod:
    environment:
      name: production
      url: ${{ vars.PROD_URL }}   # shown in Actions UI
    steps:
      - run: deploy to ${{ vars.PROD_URL }}
        env:
          PROD_URL: ${{ vars.PROD_URL }}
```

### Concurrency groups

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false   # wait, don't cancel (safer for deployments)
```

At the workflow level, this prevents two production deploys from running simultaneously. `cancel-in-progress: true` would cancel the older one, which is safer for CI but risky for deploy.

### Deployment status

GitHub automatically creates a deployment record when a job uses `environment:`. You can see deployment history at:
`https://github.com/<owner>/<repo>/deployments`
