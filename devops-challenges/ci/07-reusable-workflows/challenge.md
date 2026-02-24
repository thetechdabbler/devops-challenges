# Challenge — Reusable Workflows

## Scenario

Your organization has 8 Python microservices. Each has its own CI workflow — 8 copies of nearly identical YAML. When you need to update the Python version or add a new linting step, you have to open 8 PRs. You need a single reusable workflow that all services call.

---

## Problems to Fix

The starter has **four** issues:

1. The reusable workflow `.github/workflows/python-ci.yml` uses `on: push` instead of `on: workflow_call` — it can't be called by other workflows
2. The `inputs:` block is missing — callers can't pass the Python version or test command
3. The caller workflow calls the reusable workflow with a local path — should use the `uses:` key at the job level, not the step level
4. The `secrets: inherit` line is missing from the caller — secrets from the caller repo aren't passed to the reusable workflow

---

## Tasks

1. Convert `.github/workflows/python-ci.yml` to a reusable workflow using `on: workflow_call`
2. Add `inputs` for `python-version` (default `"3.11"`) and `test-command` (default `pytest`)
3. Fix the caller workflow to call it correctly at job level with `uses:`
4. Add `secrets: inherit` to the caller
5. Test by calling it from two different service directories

---

## Acceptance Criteria

- [ ] `python-ci.yml` has `on: workflow_call` with defined inputs
- [ ] The caller workflow uses `uses: ./.github/workflows/python-ci.yml` at the job level
- [ ] Passing `python-version: "3.10"` in the caller overrides the default
- [ ] Secrets from the calling workflow are available in the reusable workflow

---

## Learning Notes

### Reusable workflow trigger

```yaml
# .github/workflows/python-ci.yml
on:
  workflow_call:
    inputs:
      python-version:
        type: string
        default: "3.11"
        required: false
      test-command:
        type: string
        default: "pytest"
        required: false
    secrets:
      API_KEY:
        required: false
```

### Calling a reusable workflow

```yaml
# .github/workflows/service-ci.yml
jobs:
  ci:
    uses: ./.github/workflows/python-ci.yml   # local
    # OR from another repo:
    # uses: org/shared-workflows/.github/workflows/python-ci.yml@main
    with:
      python-version: "3.12"
      test-command: "pytest --cov=myservice"
    secrets: inherit   # passes all calling workflow's secrets
```

### Key rule

Reusable workflows are called at the **job level** (`jobs.<job>.uses:`), not at the step level (`steps[].uses:`). Each call creates a separate job.

### inputs vs secrets

```yaml
inputs:
  python-version:
    type: string   # string | boolean | number
    default: "3.11"
    required: false
    description: "Python version to use"

secrets:
  API_KEY:
    required: false
    description: "API key for integration tests"
```

Use `inputs` for non-sensitive values. Use `secrets` for credentials (or `secrets: inherit` to pass everything).
