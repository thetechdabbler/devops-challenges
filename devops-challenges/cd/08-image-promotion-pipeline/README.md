# Exercise 08 — Image Promotion Pipeline

Fix an image promotion pipeline so images are scanned, tagged with immutable SHAs, signed, and pushed securely to production.

## Quick Start

```bash
# Trigger promotion manually
gh workflow run promote.yml -f sha=abc1234

# Verify production image
docker pull prod.registry.io/devops-app:abc1234

# Verify signature
cosign verify prod.registry.io/devops-app:abc1234 --key cosign.pub
```

## Files

- `starter/promote.yml` — broken promotion workflow (5 bugs)
- `solutions/promote.yml` — working workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
