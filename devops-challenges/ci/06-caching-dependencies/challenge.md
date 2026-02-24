# Challenge — Caching Dependencies

## Scenario

Your CI workflow takes 4 minutes to run — 3 of those are `pip install`. Every run downloads the same packages from PyPI even though `requirements.txt` hasn't changed. With 20 developers pushing 5 times a day, that's 6+ hours of wasted compute time daily.

---

## Problems to Fix

The starter workflow has **four** issues:

1. No pip cache — packages are downloaded fresh on every run
2. The cache key doesn't include `requirements.txt` — the cache is never invalidated when dependencies change
3. `actions/setup-python@v5` has a built-in cache option (`cache: 'pip'`) that's not being used
4. There is no `cache-dependency-path` — when multiple requirements files exist, only one is hashed

---

## Tasks

1. Add pip caching to the workflow using `actions/setup-python`'s built-in cache
2. Set `cache-dependency-path` to include both `requirements.txt` and `requirements-dev.txt`
3. Verify the cache is used: run the workflow twice and compare the `pip install` time
4. Change a dependency and verify the cache is invalidated (re-downloads)
5. Add a manual cache clear step using `actions/cache` directly (bonus)

---

## Acceptance Criteria

- [ ] Second workflow run shows `Cache hit` for pip packages
- [ ] Changing `requirements.txt` invalidates the cache on the next run
- [ ] `pip install` in the second run takes less than 10 seconds (vs 60+ without cache)
- [ ] `cache-dependency-path` covers both requirements files

---

## Learning Notes

### Built-in pip cache in setup-python

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: "3.11"
    cache: "pip"
    cache-dependency-path: |
      requirements.txt
      requirements-dev.txt
```

This automatically:
1. Generates a cache key from the requirements file hash
2. Restores the cache before `pip install`
3. Saves the cache after `pip install`

### Manual cache control

```yaml
- uses: actions/cache@v4
  id: pip-cache
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- run: pip install -r requirements.txt
```

`restore-keys` provides fallback keys — if the exact key misses, try the prefix. Useful for partial cache hits when only one package changed.

### What to cache

| Tool | Cache path | Key |
|------|-----------|-----|
| pip | `~/.cache/pip` | hash of requirements files |
| npm | `~/.npm` | hash of `package-lock.json` |
| gradle | `~/.gradle/caches` | hash of `*.gradle` files |
| maven | `~/.m2` | hash of `pom.xml` |
