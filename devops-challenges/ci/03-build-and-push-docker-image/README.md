# 03 — Build and Push Docker Image

**Level**: Intermediate | **Topic**: CI

Automate Docker image builds in CI so every passing test on `main` produces a versioned, traceable image in the registry. Five issues to fix.

## Prerequisites

- A Docker Hub account (free)
- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets added to your GitHub repo

## Quick Start

```bash
cp starter/ci.yml .github/workflows/ci.yml
# Fix the 5 issues, then push to main
# Check Docker Hub — you should see an image tagged with the git SHA
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/03-build-and-push-docker-image/`](../../../solutions/ci/03-build-and-push-docker-image/)
