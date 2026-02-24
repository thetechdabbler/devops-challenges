# 07 — Reusable Workflows

**Level**: Advanced | **Topic**: CI

Convert a copy-pasted CI workflow into a reusable workflow that all services call with per-service overrides. Four issues to fix.

## Quick Start

```bash
cp starter/python-ci.yml .github/workflows/python-ci.yml
cp starter/service-ci.yml .github/workflows/service-ci.yml
# Fix the 4 issues and push
# The service-ci workflow should call python-ci as a job
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/07-reusable-workflows/`](../../../solutions/ci/07-reusable-workflows/)
