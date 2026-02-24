# Exercise 07 — Multi-Environment Promotion

Fix a CD workflow so releases flow sequentially through dev → staging → production with proper gating.

## Quick Start

```bash
# Set up GitHub Environments (Settings → Environments)
# Add "production" with required reviewers

# Push to main to trigger pipeline
git push origin main

# Or manually promote
gh workflow run cd.yml -f environment=staging
```

## Files

- `starter/cd.yml` — broken promotion workflow (5 bugs)
- `solutions/cd.yml` — working sequential promotion workflow
- `solutions/step-by-step-solution.md` — explanation of each fix
