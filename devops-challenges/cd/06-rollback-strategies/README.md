# Exercise 06 — Rollback Strategies

Fix a CD workflow so failed deployments automatically roll back to the last good version and notify the team.

## Quick Start

```bash
# View rollout history
kubectl rollout history deployment/devops-app -n prod

# Manual rollback
kubectl rollout undo deployment/devops-app -n prod

# Verify rollback
kubectl rollout status deployment/devops-app -n prod
```

## Files

- `starter/cd.yml` — broken rollback workflow (5 bugs)
- `solutions/cd.yml` — working workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
