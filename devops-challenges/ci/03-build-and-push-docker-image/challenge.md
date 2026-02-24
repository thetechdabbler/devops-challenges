# Challenge — Build and Push Docker Image

## Scenario

Your CI pipeline runs tests but the Docker image is built manually by someone on the team before every deploy. This causes inconsistency — different builds, different machines, different results. You need CI to automatically build and push a Docker image to a registry whenever tests pass on `main`.

---

## Problems to Fix

The starter workflow has **five** issues:

1. The Docker build job runs unconditionally — it should only run after the test job passes (`needs: test`)
2. The registry login step uses `docker login` with a hardcoded password — use the `docker/login-action` with secrets instead
3. The image tag is hardcoded to `latest` — tag with both `latest` AND the git SHA for traceability
4. The build uses plain `docker build` — use `docker/build-push-action` for multi-platform support and build cache
5. There is no `docker/setup-buildx-action` step — required for `build-push-action`

---

## Tasks

1. Fix all five issues
2. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets to your GitHub repository
3. Push to `main` and verify the image appears in your Docker Hub repository
4. Verify the image is tagged with both `latest` and the git SHA
5. Add a job that runs a smoke test against the pushed image

---

## Acceptance Criteria

- [ ] The build job only runs after the test job succeeds
- [ ] No credentials appear in the workflow YAML
- [ ] The pushed image has two tags: `latest` and the 7-character git SHA
- [ ] `docker pull <your-image>:latest` succeeds after a workflow run
- [ ] Failing tests prevent the image from being built or pushed

---

## Learning Notes

### Secrets in GitHub Actions

Store credentials in **Settings → Secrets and variables → Actions → New repository secret**.

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Never put credentials in the workflow YAML — they end up in git history and logs.

### Build and push with docker/build-push-action

```yaml
- name: Set up Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      myuser/myapp:latest
      myuser/myapp:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Generating image tags

```yaml
- name: Generate tags
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: myuser/myapp
    tags: |
      type=sha,prefix=,suffix=,format=short
      type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
```

### needs — job dependency

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]

  build:
    needs: test         # only runs if test succeeds
    runs-on: ubuntu-latest
    steps: [...]
```
