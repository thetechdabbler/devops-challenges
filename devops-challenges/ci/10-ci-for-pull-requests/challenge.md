# Challenge — CI for Pull Requests

## Scenario

Your team merges PRs without any automated quality gates. Reviewers have to manually check that tests pass, the PR doesn't break `main`, and the branch is up to date. You need CI to enforce branch protection rules and post status checks directly on the PR.

---

## Problems to Fix

The starter workflow has **five** issues:

1. The workflow only triggers on `push` — pull requests don't get CI checks
2. The `if: github.event_name == 'pull_request'` condition is on the wrong job — it should be on the Docker push step, not on tests
3. There is no `pull-requests: write` permission — the workflow can't post PR comments
4. The PR comment step uses `github.event.issue.number` — for pull request events, use `github.event.pull_request.number`
5. Branch protection rules are not described — the challenge requires understanding how to require status checks

---

## Tasks

1. Add `pull_request` to the `on:` triggers
2. Add permissions: `pull-requests: write` and `contents: read`
3. Add a step that posts a comment on the PR with the test results summary
4. Fix the PR number reference
5. Configure branch protection in GitHub to require the `test` status check before merging

---

## Acceptance Criteria

- [ ] A PR gets CI status checks from this workflow (green/red checkmarks)
- [ ] The workflow posts a comment on the PR with a test summary
- [ ] The `build-and-push` job is skipped on pull requests (only runs on `main`)
- [ ] Merging is blocked if the `test` check fails
- [ ] `github.event.pull_request.number` is used in the PR comment step

---

## Learning Notes

### PR-specific triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
```

`synchronize` triggers when new commits are pushed to the PR branch.

### Permissions

```yaml
permissions:
  contents: read         # read repo code
  pull-requests: write   # post comments on PRs
  checks: write          # create status checks
  packages: write        # push to GHCR
```

Minimal permissions = minimal blast radius if the workflow is compromised.

### Posting a PR comment

```yaml
- name: Comment on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '✅ All tests passed!'
      })
```

### Requiring status checks

1. Go to **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Check **Require status checks to pass before merging**
4. Search for and add your workflow job name (e.g., `test`)
5. Check **Require branches to be up to date before merging**

### Checking event type

```yaml
# Only push to Docker Hub on main, not on PRs
- name: Push image
  if: github.event_name != 'pull_request'
  uses: docker/build-push-action@v5
  with:
    push: true
```
