# Resources — Image Promotion Pipeline

## crane: Image Copy Tool

```bash
# Install crane
go install github.com/google/go-containerregistry/cmd/crane@latest

# Copy image between registries (no re-pull)
crane copy \
  dev.registry.io/app:sha-abc123 \
  prod.registry.io/app:sha-abc123

# Check if tag exists
crane digest prod.registry.io/app:sha-abc123 2>/dev/null && echo exists
```

## Trivy Vulnerability Scan

```yaml
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: dev.registry.io/devops-app:${{ github.sha }}
    format: table
    severity: CRITICAL,HIGH
    exit-code: "1"          # fail the step on findings
    ignore-unfixed: true    # skip CVEs with no fix available
```

## Cosign Image Signing

```bash
# Generate key pair (store private key as secret)
cosign generate-key-pair

# Sign image
cosign sign --key cosign.key prod.registry.io/devops-app:sha-abc123

# Verify signature
cosign verify --key cosign.pub prod.registry.io/devops-app:sha-abc123
```

## Immutability Check Pattern

```bash
# Fail if tag already exists in prod
if crane digest prod.registry.io/devops-app:$SHA 2>/dev/null; then
  echo "ERROR: tag $SHA already exists in production registry"
  exit 1
fi
```

## Official Docs

- [Trivy Action](https://github.com/aquasecurity/trivy-action)
- [cosign](https://docs.sigstore.dev/cosign/overview/)
- [crane](https://github.com/google/go-containerregistry/blob/main/cmd/crane/README.md)
