# Challenge — Your First GitHub Actions Workflow

## Scenario

Your team pushes code directly to `main` with no automated checks. A broken import slipped through last week and took down production for 45 minutes. You need a basic CI workflow that runs on every push and at minimum verifies the app can be imported without errors.

---

## Problems to Fix

The starter `.github/workflows/ci.yml` has **five** errors:

1. The `on:` trigger only fires on `push` to `main` — it should also fire on `pull_request`
2. The `runs-on` is missing — GitHub Actions requires a runner
3. `actions/checkout` is version `v1` — use `v4` (current)
4. The Python version step uses `python-version: 3` (major only) — pin to `3.11`
5. The test command `python test.py` doesn't exist — the correct command is `python -m pytest` (or `python -c "import app"` for a smoke test)

---

## Tasks

1. Fix all five errors in `.github/workflows/ci.yml`
2. Push to a branch and verify the workflow runs in the GitHub Actions tab
3. Intentionally break `app.py` (add a syntax error) and verify the workflow fails
4. Fix the syntax error and verify the workflow passes
5. Add a step that prints the Python version for debugging

---

## Acceptance Criteria

- [ ] The workflow appears in the GitHub Actions tab when you push
- [ ] A syntax error in `app.py` causes the workflow to fail with a non-zero exit code
- [ ] A clean `app.py` causes the workflow to pass (green checkmark)
- [ ] The workflow runs on both `push` and `pull_request` events
- [ ] `runs-on: ubuntu-latest` is set

---

## Learning Notes

### Workflow file location

GitHub Actions workflows live in `.github/workflows/`. Any `.yml` or `.yaml` file there is treated as a workflow.

### Workflow anatomy

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: python -m pytest
```

### Key concepts

- **Workflow**: the YAML file — defines what runs and when
- **Event** (`on:`): what triggers the workflow (push, pull_request, schedule, workflow_dispatch)
- **Job**: a group of steps that run on the same runner
- **Step**: a single action (`uses:`) or shell command (`run:`)
- **Runner**: the virtual machine that executes the job (`ubuntu-latest`, `macos-latest`, `windows-latest`)
- **Action**: a reusable step from the GitHub Marketplace (`actions/checkout`, `actions/setup-python`)
