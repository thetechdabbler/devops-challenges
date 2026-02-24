# Resources — Caching Dependencies

## Built-in Cache (setup-python)

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: "3.11"
    cache: "pip"                    # enables built-in pip cache
    cache-dependency-path: |        # files to hash for the cache key
      requirements.txt
      requirements-dev.txt
```

GitHub automatically generates a key from the OS, Python version, and file hashes.

## Manual Cache (actions/cache)

```yaml
- uses: actions/cache@v4
  id: pip-cache
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Install (skip if cache hit)
  if: steps.pip-cache.outputs.cache-hit != 'true'
  run: pip install -r requirements.txt
```

## hashFiles() Function

```yaml
# Hash a single file
${{ hashFiles('requirements.txt') }}

# Hash multiple files (glob)
${{ hashFiles('**/requirements*.txt') }}

# Hash all lock files
${{ hashFiles('package-lock.json', 'yarn.lock') }}
```

## Cache Limits

- Max cache entry size: 10GB
- Max total cache per repo: 10GB (older entries evicted)
- Cache is isolated per branch; `main` cache can be accessed from PRs but not vice versa

## Cache Status

```yaml
- uses: actions/cache@v4
  id: my-cache
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}

- run: echo "Cache hit? ${{ steps.my-cache.outputs.cache-hit }}"
```

## Official Docs

- [Caching dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/cache](https://github.com/actions/cache)
- [setup-python cache](https://github.com/actions/setup-python#caching-packages-dependencies)
