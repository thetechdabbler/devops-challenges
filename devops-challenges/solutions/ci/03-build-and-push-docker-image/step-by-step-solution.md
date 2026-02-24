# Solution — Build and Push Docker Image

## Fixes Applied

### Fix 1: needs: test

```yaml
build-and-push:
  needs: test   # only runs if test passes
```

Without `needs`, both jobs start simultaneously. A test failure won't stop the broken image from being built and pushed.

### Fix 2: docker/login-action with secrets

```yaml
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Secrets are masked in logs. Hardcoded passwords appear in logs, git history, and anyone who can read the workflow file.

Use a Docker Hub **access token** (not your password) — create one at hub.docker.com → Account Settings → Security.

### Fix 3: SHA tag via metadata-action

```yaml
- uses: docker/metadata-action@v5
  id: meta
  with:
    images: myuser/devops-app
    tags: |
      type=sha,prefix=,format=short
      type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
```

This generates two tags: `abc1234` (7-char SHA) and `latest`. The SHA tag makes every build traceable — you can always find which commit produced which image.

### Fix 4: docker/build-push-action

```yaml
- uses: docker/build-push-action@v5
  with:
    context: .
    push: ${{ github.event_name != 'pull_request' }}
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

The action handles multi-platform builds and GitHub Actions cache integration. `push: false` on pull requests lets you verify the build succeeds without pushing to the registry.

### Fix 5: docker/setup-buildx-action

```yaml
- uses: docker/setup-buildx-action@v3
```

`build-push-action` requires Buildx. Without this step it fails with "buildx not found."
