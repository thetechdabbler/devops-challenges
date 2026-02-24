# 01 — Your First GitHub Actions Workflow

**Level**: Beginner | **Topic**: CI

Write a GitHub Actions workflow that runs on every push and pull request, verifies the app can be imported, and fails fast when there's a syntax error. Five errors to fix.

## Quick Start

```bash
# Fork or push to your own GitHub repo first
# Copy the starter workflow
mkdir -p .github/workflows
cp starter/ci.yml .github/workflows/ci.yml

# Fix the 5 errors, then push to trigger the workflow
git add .github/workflows/ci.yml
git commit -m "ci: add initial workflow"
git push
# Check the Actions tab in your GitHub repo
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/01-your-first-github-actions-workflow/`](../../../solutions/ci/01-your-first-github-actions-workflow/)
