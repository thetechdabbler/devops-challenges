# Challenge — Matrix Builds

## Scenario

Your Flask app needs to support Python 3.10, 3.11, and 3.12 because different customers are on different versions. Currently you only test against 3.11. A 3.12 breaking change slipped through and caused a customer outage. You need CI to test all supported versions simultaneously.

---

## Problems to Fix

The starter workflow has **four** issues:

1. The matrix is defined but `python-version` isn't referenced in the `setup-python` step — it uses a hardcoded `"3.11"`
2. The matrix `include:` block has a syntax error — the extra key `experimental: true` is valid but the conditional `continue-on-error` referencing it is wrong
3. There is no `fail-fast: false` — if Python 3.12 fails, the entire matrix is cancelled including 3.10 and 3.11
4. The job name doesn't include the matrix variable — in the Actions UI all runs show the same name

---

## Tasks

1. Fix all four issues
2. Configure the matrix to test Python 3.10, 3.11, and 3.12
3. Mark 3.12 as experimental so failures don't block the PR
4. Set `fail-fast: false` so all matrix variants run even if one fails
5. Verify all three Python versions appear as separate jobs in the Actions UI

---

## Acceptance Criteria

- [ ] Three separate jobs appear in the Actions run, one per Python version
- [ ] Each job name includes the Python version (e.g., `test (3.11)`)
- [ ] A failure in 3.12 doesn't cancel the 3.10 and 3.11 jobs
- [ ] `fail-fast: false` is set in the strategy

---

## Learning Notes

### Matrix strategy

```yaml
jobs:
  test:
    strategy:
      fail-fast: false      # don't cancel others on first failure
      matrix:
        python-version: ["3.10", "3.11", "3.12"]

    runs-on: ubuntu-latest

    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
```

Each `matrix.python-version` value runs as a separate job, all in parallel.

### Matrix with include/exclude

```yaml
matrix:
  os: [ubuntu-latest, macos-latest]
  python-version: ["3.10", "3.11"]
  include:
    - python-version: "3.12"
      experimental: true    # adds extra metadata to this combination
  exclude:
    - os: macos-latest
      python-version: "3.10"   # skip this combination
```

### Experimental jobs (continue-on-error)

```yaml
jobs:
  test:
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
        include:
          - python-version: "3.12"
            experimental: true

    continue-on-error: ${{ matrix.experimental == true }}
```

`continue-on-error: true` means the job can fail without failing the overall workflow.

### Matrix in job name

```yaml
jobs:
  test (3.10):   # GitHub renders this automatically from the matrix key
```

GitHub automatically appends `(value)` to the job name for each matrix dimension.
