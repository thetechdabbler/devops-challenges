# Resources — CI for Pull Requests

## PR Triggers

```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
    # Types:
    # opened        - PR created
    # synchronize   - new commits pushed to PR branch
    # reopened      - closed PR reopened
    # closed        - PR closed (merged or dismissed)
    # labeled       - label added
```

## Permissions

```yaml
permissions:
  contents: read         # read repo files
  pull-requests: write   # comment on PRs, add labels
  checks: write          # create/update check runs
  issues: write          # comment on issues
  packages: write        # push to GHCR
```

## PR Comment with github-script

```yaml
- uses: actions/github-script@v7
  with:
    script: |
      const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
      });

      // Update existing bot comment instead of creating duplicates
      const botComment = comments.find(c => c.user.type === 'Bot' && c.body.includes('Test Results'));

      const body = `## Test Results\n✅ All tests passed on ${context.sha.slice(0,7)}`;

      if (botComment) {
        await github.rest.issues.updateComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: botComment.id,
          body
        });
      } else {
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: context.issue.number,
          body
        });
      }
```

## Branch Protection Setup

1. **Settings → Branches → Add rule**
2. Pattern: `main`
3. Check: **Require status checks to pass before merging**
4. Add status check: `test` (the job name from your workflow)
5. Check: **Require branches to be up to date before merging**
6. Check: **Do not allow bypassing the above settings**

## context.issue.number vs github.event.pull_request.number

Both work for PRs. `context.issue.number` is provided by actions/github-script and works for both issues and PRs. Use it in scripts.

For workflow expressions, use `${{ github.event.pull_request.number }}`.

## Official Docs

- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
- [actions/github-script](https://github.com/actions/github-script)
- [Branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
