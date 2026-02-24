# Resources — Build and Push Docker Image

## Docker Actions

```yaml
# Set up Buildx (required for build-push-action)
- uses: docker/setup-buildx-action@v3

# Login
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
    # For GHCR:
    # registry: ghcr.io
    # username: ${{ github.actor }}
    # password: ${{ secrets.GITHUB_TOKEN }}

# Generate tags automatically
- uses: docker/metadata-action@v5
  id: meta
  with:
    images: myuser/myapp
    tags: |
      type=sha,prefix=,format=short
      type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

# Build and push
- uses: docker/build-push-action@v5
  with:
    context: .
    push: ${{ github.event_name != 'pull_request' }}
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Context Variables

```yaml
${{ github.sha }}           # full 40-char commit SHA
${{ github.sha[:7] }}       # doesn't work in expressions
# Use steps.meta.outputs.tags from metadata-action instead

${{ github.ref }}           # refs/heads/main
${{ github.ref_name }}      # main
${{ github.event_name }}    # push | pull_request
${{ github.actor }}         # user who triggered the run
${{ github.repository }}    # owner/repo-name
```

## Registry Options

| Registry | Login | Image prefix |
|----------|-------|--------------|
| Docker Hub | `DOCKERHUB_TOKEN` | `username/image` |
| GHCR | `GITHUB_TOKEN` (built-in) | `ghcr.io/owner/image` |
| ECR | AWS credentials action | `account.dkr.ecr.region.amazonaws.com/image` |

## Official Docs

- [docker/build-push-action](https://github.com/docker/build-push-action)
- [docker/metadata-action](https://github.com/docker/metadata-action)
- [docker/login-action](https://github.com/docker/login-action)
