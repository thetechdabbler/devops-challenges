# Solution — Image Promotion Pipeline

## Fixes Applied

### Fix 1: Use SHA tag instead of `latest`

```bash
# Before
docker tag ... prod.registry.io/devops-app:latest

# After
docker tag ... prod.registry.io/devops-app:$IMAGE_SHA
```

`latest` is a mutable tag — it can be overwritten by any subsequent promotion. The SHA tag ties the production image directly to the Git commit, enabling precise rollbacks and audit trails.

### Fix 2: Trivy vulnerability scan

```yaml
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: dev.registry.io/devops-app:${{ env.IMAGE_SHA }}
    severity: CRITICAL
    exit-code: "1"
```

Scans the dev image before it touches production. `exit-code: "1"` fails the pipeline on critical findings, blocking broken or vulnerable images.

### Fix 3: Immutability check

```bash
if docker manifest inspect prod.registry.io/devops-app:$IMAGE_SHA 2>/dev/null; then
  echo "ERROR: tag already exists"
  exit 1
fi
```

Overwrting a production tag breaks traceability — you can no longer trust that a given tag maps to the same image bytes it did before. This check prevents silent overwrites.

### Fix 4: Login to production registry

```yaml
- name: Login to production registry
  uses: docker/login-action@v3
  with:
    registry: prod.registry.io
    username: ${{ secrets.PROD_REGISTRY_USER }}
    password: ${{ secrets.PROD_REGISTRY_TOKEN }}
```

The dev login only authorizes pulling from the dev registry. Pushing to prod.registry.io requires separate credentials stored as secrets.

### Fix 5: Sign the promoted image

```bash
cosign sign --key env://COSIGN_PRIVATE_KEY prod.registry.io/devops-app:$IMAGE_SHA
```

A cosign signature proves the image was promoted through this authorized pipeline. Any deployment system can verify the signature and reject unsigned images — preventing out-of-band pushes from reaching production.

---

## Result

- Production images are tagged with immutable Git SHAs
- Critical CVEs block promotion before the image reaches prod
- Existing tags are never silently overwritten
- Push uses dedicated prod registry credentials
- Images are signed and verifiable with `cosign verify`
