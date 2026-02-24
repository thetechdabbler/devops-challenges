# Solution — CI for Pull Requests

## Fixes Applied

### Fix 1: pull_request trigger

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
```

Without `pull_request`, PRs get no CI checks. GitHub shows no status check on the PR, and branch protection can't block merges on failures.

### Fix 2: Condition on build-and-push, not test

```yaml
build-and-push:
  if: github.event_name != 'pull_request'
```

Tests should always run on PRs. The Docker push should only happen on `main`. Moving the condition from the comment step (where it was on the test job) to the build job achieves both goals.

### Fix 3: permissions

```yaml
permissions:
  contents: read
  pull-requests: write
```

Without `pull-requests: write`, the `createComment` API call returns 403 Forbidden. GitHub Actions' default `GITHUB_TOKEN` has `pull-requests: read` only.

### Fix 4: PR number reference

```yaml
# Before (wrong)
issue_number: context.payload.issue.number  // undefined for PR events

# After
issue_number: context.issue.number          // works for both issues and PRs
```

`context.issue.number` is the correct property in `actions/github-script`. For PR events it returns the PR number; for issue events it returns the issue number.

### Fix 5: Branch protection (GitHub UI)

Configure in **Settings → Branches → Add branch protection rule**:
- Branch: `main`
- Require status checks: add `test`
- Require up-to-date branches: checked

Now merging is blocked until the `test` job passes.

---

## Result

PRs now:
1. Trigger CI automatically on open and new commits
2. Show green/red checkmarks on the PR page
3. Receive a comment with the test summary
4. Cannot be merged to `main` if tests fail
5. Don't trigger Docker pushes (only production-ready merges do)
