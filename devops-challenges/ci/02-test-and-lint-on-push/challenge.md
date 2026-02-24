# Challenge — Test and Lint on Push

## Scenario

Your team has unit tests and a linter (`flake8`) but they only run locally when developers remember to. You need a CI workflow that automatically runs both on every push, reports failures clearly, and uploads a test coverage report as an artifact.

---

## Problems to Fix

The starter workflow has **five** issues:

1. The lint step runs `flake8 .` but there's no `.flake8` config — it flags every line over 79 chars in the Flask app; add a config to set `max-line-length = 120`
2. The test step doesn't generate a coverage report — add `--cov=app --cov-report=xml`
3. `pytest` is not in `requirements.txt` — it needs to be installed before the test step
4. The jobs run sequentially in one job — split `lint` and `test` into separate parallel jobs
5. There is no artifact upload step — the coverage XML is generated but never saved

---

## Tasks

1. Fix all five issues
2. Split into two parallel jobs: `lint` and `test`
3. Configure `flake8` with a `.flake8` file allowing 120-char lines
4. Add `pytest`, `pytest-cov`, and `flake8` to a `requirements-dev.txt`
5. Upload the coverage XML as a GitHub Actions artifact
6. Verify both jobs run in parallel in the Actions UI

---

## Acceptance Criteria

- [ ] Both `lint` and `test` jobs appear in the workflow run and run in parallel
- [ ] `flake8` passes on the sample app without false positives
- [ ] `pytest` runs and generates `coverage.xml`
- [ ] `coverage.xml` appears as a downloadable artifact in the Actions run
- [ ] Intentionally adding a linting error causes the `lint` job to fail while `test` still passes

---

## Learning Notes

### Parallel jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    steps: [...]
```

Jobs in the same workflow run in parallel by default. Each job gets its own fresh runner.

### Sequential jobs (depends-on)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: build     # waits for build to succeed
    runs-on: ubuntu-latest
    steps: [...]
```

### Artifact upload

```yaml
- name: Upload coverage report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage.xml
    retention-days: 7
```

### .flake8 config

```ini
[flake8]
max-line-length = 120
exclude = .git,__pycache__,.venv,venv
per-file-ignores =
    __init__.py: F401   # allow unused imports in __init__
```
