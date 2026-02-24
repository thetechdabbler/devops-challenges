# Resources — Matrix Builds

## Matrix Strategy Reference

```yaml
strategy:
  fail-fast: false        # keep running other matrix jobs on failure
  max-parallel: 3         # limit concurrent jobs (optional)
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
    os: [ubuntu-latest, macos-latest]
    # Runs all combinations: 3 × 2 = 6 jobs
```

## include / exclude

```yaml
matrix:
  python-version: ["3.10", "3.11"]
  include:
    # Add an extra combination not in the base matrix
    - python-version: "3.12"
      experimental: true
    # Add extra data to an existing combination
    - python-version: "3.11"
      extra-var: "hello"
  exclude:
    # Remove a specific combination
    - python-version: "3.10"
```

## Accessing Matrix Values

```yaml
steps:
  - uses: actions/setup-python@v5
    with:
      python-version: ${{ matrix.python-version }}

  - run: echo "Testing on Python ${{ matrix.python-version }}"
```

## continue-on-error

```yaml
# Per-job (applies to all matrix variants)
continue-on-error: true

# Per matrix variant (experimental pattern)
continue-on-error: ${{ matrix.experimental == true }}
```

## Official Docs

- [Matrix strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [continue-on-error](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idcontinue-on-error)
