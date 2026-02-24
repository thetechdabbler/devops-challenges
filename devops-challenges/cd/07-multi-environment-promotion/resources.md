# Resources — Multi-Environment Promotion

## Sequential Job Dependencies

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

  deploy-dev:
    needs: test          # waits for test

  deploy-staging:
    needs: deploy-dev    # waits for dev

  deploy-prod:
    needs: deploy-staging
    environment: production   # requires approval
```

## GitHub Environments Setup

1. Go to **Settings → Environments → New environment**
2. Name it `production`
3. Add **Required reviewers** (your team members)
4. Optionally set **Deployment branches** to `main` only

## Passing Data Between Jobs

```yaml
jobs:
  build:
    outputs:
      image-tag: ${{ steps.tag.outputs.value }}
    steps:
      - id: tag
        run: echo "value=${{ github.sha }}" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.image-tag }}"
```

## workflow_dispatch with Inputs

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
        default: "dev"
        type: choice
        options: [dev, staging, production]
```

## Official Docs

- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Job outputs](https://docs.github.com/en/actions/using-jobs/defining-outputs-for-jobs)
- [workflow_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch)
