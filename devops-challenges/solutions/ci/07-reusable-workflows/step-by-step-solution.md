# Solution — Reusable Workflows

## Fixes Applied

### Fix 1 & 2: on: workflow_call with inputs

```yaml
on:
  workflow_call:
    inputs:
      python-version:
        type: string
        default: "3.11"
        required: false
```

`workflow_call` is what makes a workflow reusable. Without it, other workflows cannot call it. The `inputs` block defines what callers can pass.

Use `${{ inputs.python-version }}` inside the workflow to reference the passed value.

### Fix 3: Job-level uses

```yaml
# Wrong (step level — not supported)
steps:
  - uses: ./.github/workflows/python-ci.yml

# Correct (job level)
jobs:
  ci:
    uses: ./.github/workflows/python-ci.yml
    with:
      python-version: "3.12"
```

Reusable workflows run as entire jobs, not individual steps. Each call spawns a new runner.

### Fix 4: secrets: inherit

```yaml
jobs:
  ci:
    uses: ./.github/workflows/python-ci.yml
    secrets: inherit
```

Without `secrets: inherit`, the reusable workflow has no access to the calling repo's secrets. They must be explicitly passed or inherited.

---

## Benefits

Before (8 services, 8 workflows):
- Updating Python version = 8 PRs
- Adding a lint step = 8 PRs
- Inconsistent configurations across services

After (1 reusable workflow):
- Updating Python version = 1 PR to `python-ci.yml`
- Adding a lint step = 1 change, all services get it immediately
- Consistent CI across all services
