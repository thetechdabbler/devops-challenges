# Solution — Your First GitHub Actions Workflow

## The Fixed Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:                # Fix 1: added pull_request trigger
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest     # Fix 2: added runner

    steps:
      - name: Checkout code
        uses: actions/checkout@v4   # Fix 3: updated to v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"    # Fix 4: pinned version

      - name: Print Python version
        run: python --version

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Smoke test
        run: python -c "import app; print('Import OK')"   # Fix 5: valid command
```

---

## Fixes Explained

### Fix 1: pull_request trigger

Without `pull_request`, CI only runs after merging — too late. Adding it means CI runs on the PR branch *before* merge, letting you block merges on failures.

### Fix 2: runs-on

`runs-on` specifies the runner machine. Without it, GitHub rejects the workflow file. `ubuntu-latest` is the most common choice for Python apps.

### Fix 3: actions/checkout@v4

`v1` is years old and uses Node.js 12 (deprecated). GitHub emits warnings on old action versions. Always pin to a major version (v4) rather than a specific patch to get security fixes automatically.

### Fix 4: Python version "3.11"

`python-version: "3"` installs the latest 3.x, which changes over time. Your app may not support 3.12 breaking changes. Quote the version string to prevent YAML from interpreting it as a float (`3.1` becomes `3.10` as a float).

### Fix 5: Valid test command

`python test.py` fails with `FileNotFoundError`. The smoke test `python -c "import app"` verifies the file is parseable and all imports resolve — catching syntax errors and missing packages. Use `python -m pytest` when you have actual test files.
