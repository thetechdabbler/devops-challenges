# 06 — Caching Dependencies

**Level**: Intermediate | **Topic**: CI

Reduce CI time from 4 minutes to under 1 minute by caching pip dependencies between runs. Four issues to fix.

## Quick Start

```bash
cp starter/ci.yml .github/workflows/ci.yml
# Push twice without changing requirements.txt
# Second run should show "Cache hit" and be much faster
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/06-caching-dependencies/`](../../../solutions/ci/06-caching-dependencies/)
