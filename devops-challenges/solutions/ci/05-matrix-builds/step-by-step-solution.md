# Solution — Matrix Builds

## Fixes Applied

### Fix 1: Reference matrix variable

```yaml
# Before (hardcoded)
python-version: "3.11"

# After
python-version: ${{ matrix.python-version }}
```

The matrix defines the values; each step must reference `${{ matrix.<key> }}` to use the current iteration's value.

### Fix 2: correct continue-on-error expression

```yaml
# Before (wrong — matrix.experimental is undefined for non-experimental versions)
continue-on-error: ${{ matrix.experimental }}

# After
continue-on-error: ${{ matrix.experimental == true }}
```

When `matrix.experimental` is not set (for 3.10 and 3.11), it evaluates to `''` (empty string). `'' == true` is `false`, so the job fails normally. `true == true` is `true`, so 3.12 failures don't block the workflow.

### Fix 3: fail-fast: false

```yaml
strategy:
  fail-fast: false
```

With `fail-fast: true` (default), if 3.10 fails immediately, GitHub cancels the 3.11 and 3.12 jobs. With `fail-fast: false`, all three run to completion so you see which versions fail.

### Fix 4: Job names include version

GitHub automatically appends `(3.10)`, `(3.11)`, `(3.12)` to the job name from the matrix key. The step name `Set up Python ${{ matrix.python-version }}` also shows the version in the step log.
