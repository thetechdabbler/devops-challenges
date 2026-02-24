# Challenge — Image Promotion Pipeline

## Scenario

Your organization uses two container registries: a development registry (`dev.registry.io`) for every build, and a production registry (`prod.registry.io`) for promoted, trusted images. The promotion pipeline copies a verified image from dev to prod.

A colleague wired up the pipeline, but it uses `latest` tags (untraceable), skips vulnerability scanning, overwrites existing production tags (breaks immutability), and doesn't authenticate to the production registry.

Fix the pipeline so image promotion is secure, traceable, and immutable.

## Your Task

The file `starter/promote.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Using `latest` tag** — promoted image is `prod.registry.io/devops-app:latest`, not a versioned tag
2. **No image scan** — no `trivy` or similar scan before promotion
3. **No immutability check** — silently overwrites an existing tag in the production registry
4. **Missing production registry login** — only the dev registry is logged in; prod push will fail
5. **No image signing** — promoted image has no provenance or signature

## Acceptance Criteria

- [ ] Promoted image uses the Git SHA as its tag, not `latest`
- [ ] Trivy scans the image and fails if critical CVEs are found
- [ ] Pipeline aborts if the target production tag already exists
- [ ] Pipeline authenticates to the production registry before pushing
- [ ] Image is signed with `cosign` after promotion

## Learning Notes

**Image promotion pattern:**
```
dev.registry.io/app:sha-abc123
       ↓ scan
       ↓ check tag doesn't exist
       ↓ copy to prod
prod.registry.io/app:sha-abc123
       ↓ sign with cosign
```

**Trivy scan in CI:**
```yaml
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: dev.registry.io/devops-app:${{ github.sha }}
    severity: CRITICAL
    exit-code: "1"
```

**Cosign image signing:**
```bash
cosign sign --key cosign.key prod.registry.io/devops-app:${{ github.sha }}
```
