# 02 — Test and Lint on Push

**Level**: Beginner | **Topic**: CI

Split CI into parallel lint and test jobs, configure flake8, generate a coverage report, and upload it as a GitHub Actions artifact. Five issues to fix.

## Quick Start

```bash
cp starter/ci.yml .github/workflows/ci.yml
cp starter/.flake8 .flake8

# Create requirements-dev.txt
echo "flake8\npytest\npytest-cov" > requirements-dev.txt

# Fix the 5 issues and push
git push
# Watch the Actions tab — both jobs should run in parallel
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/ci/02-test-and-lint-on-push/`](../../../solutions/ci/02-test-and-lint-on-push/)
