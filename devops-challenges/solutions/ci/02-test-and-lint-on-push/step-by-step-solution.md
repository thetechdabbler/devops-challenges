# Solution — Test and Lint on Push

## Fixes Applied

### Fix 1 & 4: Split into parallel jobs

Separate `lint` and `test` jobs run in parallel on independent runners. This means a lint failure doesn't block you from seeing test results, and vice versa.

### Fix 2: Coverage flags

```bash
pytest --cov=app --cov-report=xml
```

`--cov=app` instruments the `app` module. `--cov-report=xml` writes `coverage.xml` for upload and later consumption by tools like Codecov or SonarCloud.

### Fix 3: Dev dependencies

```bash
pip install -r requirements.txt
pip install pytest pytest-cov
```

Or create `requirements-dev.txt` with `flake8`, `pytest`, `pytest-cov` and install it separately from prod deps.

### Fix 1: .flake8 config

```ini
[flake8]
max-line-length = 120
```

The Flask sample app has lines around 80-100 chars. Raising the limit to 120 eliminates false positives while still catching genuinely long lines.

### Fix 5: Artifact upload

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage.xml
    retention-days: 7
```

Artifacts are downloadable from the Actions run page. They're useful for debugging failures and feeding into coverage reporting tools.
