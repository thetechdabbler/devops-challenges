# Resources — Manual Approvals and Environments

## Setting Up a Protected Environment

1. Go to **Settings → Environments → New environment**
2. Name it `production`
3. Under **Deployment protection rules**:
   - Check **Required reviewers**
   - Add reviewer(s)
   - Optionally add a **Wait timer** (e.g., 5 minutes)
4. Click **Save protection rules**
5. Add environment-specific **Variables** (PROD_URL) and **Secrets** (DB_PASSWORD)

## Environment in Workflow

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: ${{ vars.PROD_URL }}   # shows as link in Actions UI
    steps:
      - run: deploy.sh
        env:
          PROD_URL: ${{ vars.PROD_URL }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## Concurrency

```yaml
# Workflow level (affects all jobs)
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true   # CI: cancel older runs on same branch

# Job level
jobs:
  deploy-prod:
    concurrency:
      group: deploy-production
      cancel-in-progress: false  # Deployments: wait, don't cancel
```

## Deployment History

```bash
# View via gh CLI
gh api repos/{owner}/{repo}/deployments | jq '.[].environment'

# Or in GitHub UI
# https://github.com/<owner>/<repo>/deployments
```

## Official Docs

- [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [Deployment protection rules](https://docs.github.com/en/actions/deployment/protecting-deployments/about-deployment-protection-rules)
