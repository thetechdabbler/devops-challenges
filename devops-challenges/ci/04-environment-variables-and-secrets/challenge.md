# Challenge — Environment Variables and Secrets

## Scenario

Your workflow needs different configuration for different environments: `APP_ENV=test` during CI, `APP_ENV=staging` when deploying to staging, and real API keys for integration tests. Currently the workflow hardcodes all values inline, and the API key is in plaintext in the YAML file.

---

## Problems to Fix

The starter workflow has **five** issues:

1. `API_KEY` is hardcoded in the workflow YAML — use a GitHub Actions secret
2. `APP_ENV` is set per-step instead of at the job level — move it to `env:` at job scope
3. The secret is printed with `echo $API_KEY` — GitHub masks secrets in logs but this is still bad practice
4. There is no `env:` context validation — if a required secret is missing, the job silently uses an empty string
5. Environment-specific values (staging URL, prod URL) are hardcoded — use GitHub Actions environments instead

---

## Tasks

1. Move `API_KEY` to a GitHub Actions repository secret
2. Set `APP_ENV` at job scope using `env:` instead of per-step
3. Replace the `echo $API_KEY` step with a safer validation step
4. Add a step that fails fast if required secrets are empty
5. Create a GitHub Actions environment called `staging` with its own secrets

---

## Acceptance Criteria

- [ ] No credentials appear in the workflow YAML
- [ ] `APP_ENV` is set once at job level, not repeated in every step
- [ ] The workflow fails early with a clear error if a required secret is missing
- [ ] `${{ secrets.API_KEY }}` is replaced with `***` in workflow logs
- [ ] The `staging` environment has its own `DEPLOY_URL` variable

---

## Learning Notes

### env: at different scopes

```yaml
env:
  GLOBAL_VAR: "applies to all jobs"   # workflow level

jobs:
  test:
    env:
      JOB_VAR: "applies to all steps in this job"   # job level

    steps:
      - run: echo "hello"
        env:
          STEP_VAR: "applies only to this step"   # step level
```

### Accessing secrets

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}

# Or directly in a step
- run: curl -H "Authorization: Bearer $API_KEY" https://api.example.com
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

### Fail fast on missing secrets

```yaml
- name: Validate required secrets
  run: |
    if [ -z "${{ secrets.API_KEY }}" ]; then
      echo "ERROR: API_KEY secret is not set"
      exit 1
    fi
```

### GitHub Actions environments

Environments provide protection rules and their own secrets/variables:

```yaml
jobs:
  deploy:
    environment: staging   # requires approval if configured
    env:
      DEPLOY_URL: ${{ vars.DEPLOY_URL }}   # environment variable
    steps:
      - run: deploy to $DEPLOY_URL
```
