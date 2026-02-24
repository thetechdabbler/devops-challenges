# Solution — Environment Variables and Secrets

## Fixes Applied

### Fix 1: Use secrets

```yaml
# Before
API_KEY: "abc123secret"

# After
API_KEY: ${{ secrets.API_KEY }}
```

Secrets are stored encrypted in GitHub and masked (`***`) in logs. Add them at Settings → Secrets and variables → Actions.

### Fix 2: Job-level env

```yaml
# Before: repeated in every step
steps:
  - run: pip install ...
    env:
      APP_ENV: test
  - run: pytest
    env:
      APP_ENV: test

# After: declared once at job level
jobs:
  test:
    env:
      APP_ENV: test
    steps:
      - run: pip install ...
      - run: pytest
```

### Fix 3: Remove echo of secrets

Even though GitHub masks secrets in logs, logging them is still bad practice — it creates a habit of exposing secrets and can reveal partial values or encoded forms.

### Fix 4: Fail fast on missing secrets

```yaml
- name: Validate required secrets
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    if [ -z "$API_KEY" ]; then
      echo "ERROR: API_KEY secret is not configured"
      exit 1
    fi
```

Without validation, a missing secret causes cryptic failures deep in the test run instead of a clear error at the start.

### Fix 5: Environments

Create the `staging` environment in GitHub Settings. Assign it to jobs that deploy there:

```yaml
jobs:
  deploy:
    environment: staging
    env:
      DEPLOY_URL: ${{ vars.DEPLOY_URL }}
      API_KEY: ${{ secrets.API_KEY }}   # environment-specific secret
```
