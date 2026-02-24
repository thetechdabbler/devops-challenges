# Exercise 02 — Deploy with Helm CD

Fix a GitHub Actions workflow that runs `helm upgrade` so deployments are safe, atomic, and use proper secret management.

## Quick Start

```bash
# Validate your fixed workflow syntax
gh workflow list

# Trigger manually (after pushing to main)
gh workflow run cd.yml

# Watch deployment progress
kubectl rollout status deployment/devops-app -n prod
```

## Files

- `starter/cd.yml` — broken CD workflow (5 bugs)
- `solutions/cd.yml` — working workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
