# Resources — Test and Lint on Push

## Parallel Jobs Pattern

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install flake8
      - run: flake8 .

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt pytest pytest-cov
      - run: pytest --cov=app --cov-report=xml
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.xml
```

## .flake8 Config

```ini
[flake8]
max-line-length = 120
exclude = .git,__pycache__,.venv,venv,migrations
per-file-ignores =
    __init__.py: F401
ignore = W503
```

## pytest.ini / pyproject.toml Config

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--verbose"
```

## Artifact Upload

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: coverage-report      # artifact name in UI
    path: coverage.xml         # file or directory to upload
    retention-days: 7          # auto-delete after N days
    if-no-files-found: error   # fail if nothing to upload

# Download in another job
- uses: actions/download-artifact@v4
  with:
    name: coverage-report
    path: ./reports/
```

## Official Docs

- [actions/upload-artifact](https://github.com/actions/upload-artifact)
- [pytest-cov](https://pytest-cov.readthedocs.io/en/latest/)
- [flake8 configuration](https://flake8.pycqa.org/en/latest/user/configuration.html)
