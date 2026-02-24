# Resources — Your First GitHub Actions Workflow

## Workflow Triggers

```yaml
on:
  push:                    # on any push
  push:
    branches: [main]       # only on pushes to main
  pull_request:
    branches: [main]       # only on PRs targeting main
  schedule:
    - cron: "0 9 * * 1"   # every Monday at 9am UTC
  workflow_dispatch:       # manual trigger button in UI
```

## Common Actions

```yaml
- uses: actions/checkout@v4              # check out code
- uses: actions/setup-python@v5          # install Python
  with:
    python-version: "3.11"
- uses: actions/setup-node@v4            # install Node
  with:
    node-version: "20"
- uses: actions/upload-artifact@v4       # save files between jobs
- uses: actions/download-artifact@v4     # retrieve saved files
```

## Useful Workflow Patterns

```yaml
# Run a command
- run: pip install -r requirements.txt

# Multi-line command
- run: |
    pip install -r requirements.txt
    python -m pytest --verbose

# Working directory
- run: pytest
  working-directory: ./backend

# Environment variable for a step
- run: echo "Version: $MY_VAR"
  env:
    MY_VAR: "1.0.0"

# Conditional step
- run: echo "On main!"
  if: github.ref == 'refs/heads/main'
```

## Debugging Workflows

```yaml
# Print all context info
- run: echo '${{ toJSON(github) }}'

# Print environment
- run: env | sort

# Enable debug logging (set in repo secrets)
# ACTIONS_RUNNER_DEBUG = true
# ACTIONS_STEP_DEBUG = true
```

## Official Docs

- [GitHub Actions quickstart](https://docs.github.com/en/actions/quickstart)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Marketplace](https://github.com/marketplace?type=actions)
