# Resources — Environment Variables and Secrets

## Secrets vs Variables

| | Secrets | Variables |
|--|---------|-----------|
| Masked in logs | Yes | No |
| Use for | Passwords, tokens, keys | URLs, config values |
| Access | `${{ secrets.NAME }}` | `${{ vars.NAME }}` |
| Scope | Repo, environment, org | Repo, environment, org |

## env: Scoping

```yaml
env:
  WORKFLOW_VAR: shared      # all jobs and steps

jobs:
  build:
    env:
      JOB_VAR: build-only   # all steps in this job
    steps:
      - run: echo $STEP_VAR
        env:
          STEP_VAR: step-only   # this step only
```

## Accessing Secrets Safely

```yaml
# Good: pass via env
- run: curl -H "Authorization: Bearer $TOKEN" https://api.example.com
  env:
    TOKEN: ${{ secrets.API_TOKEN }}

# Avoid: inline expansion (visible in "set -x" debug output)
- run: curl -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" https://api.example.com
```

## Secret Validation Pattern

```yaml
- name: Validate required secrets
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    missing=()
    [ -z "$API_KEY" ] && missing+=("API_KEY")
    if [ ${#missing[@]} -gt 0 ]; then
      echo "Missing secrets: ${missing[*]}"
      exit 1
    fi
    echo "All required secrets are set"
```

## Environments

Create environments in GitHub: **Settings → Environments → New environment**

```yaml
jobs:
  deploy-staging:
    environment:
      name: staging
      url: ${{ vars.DEPLOY_URL }}   # shown in Actions UI
    env:
      DEPLOY_URL: ${{ vars.DEPLOY_URL }}
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## Official Docs

- [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
- [Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
