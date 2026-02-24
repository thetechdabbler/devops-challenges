# Solution — Caching Dependencies

## Fixes Applied

### Fix 1-4: Enable built-in pip cache

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: "3.11"
    cache: "pip"
    cache-dependency-path: |
      requirements.txt
      requirements-dev.txt
```

`cache: "pip"` activates the built-in cache. The cache key is automatically generated from:
- `${{ runner.os }}`
- `${{ steps.setup-python.outputs.python-version }}`
- `${{ hashFiles(cache-dependency-path) }}`

### Why cache-dependency-path matters (Fix 2 & 4)

Without `cache-dependency-path`, the cache key only changes when the Python version changes — not when you add or remove packages. You'd get cache hits with stale packages installed.

With the path specified, changing any line in `requirements.txt` or `requirements-dev.txt` produces a new hash → new cache key → fresh install.

---

## Observing the Cache

Run 1 (cold):
```
Set up Python ... Cache not found for ...
pip install: downloading 15 packages (45s)
```

Run 2 (warm, no requirements changes):
```
Set up Python ... Cache restored from ...
pip install: using cached wheels (3s)
```

Run after adding a package to requirements.txt:
```
Set up Python ... Cache not found for ... (new hash)
pip install: downloading 16 packages (47s)
```
