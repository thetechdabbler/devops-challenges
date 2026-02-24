# Exercise 04 — Canary Releases

Fix an Argo Rollouts canary manifest so new versions roll out gradually with automated analysis.

## Quick Start

```bash
# Install Argo Rollouts controller
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Apply rollout and analysis template
kubectl apply -f starter/analysis-template.yaml
kubectl apply -f starter/rollout.yaml

# Watch the rollout
kubectl argo rollouts get rollout devops-app --watch
```

## Files

- `starter/rollout.yaml` — broken Rollout (5 bugs)
- `starter/analysis-template.yaml` — AnalysisTemplate (needs to be created)
- `solutions/rollout.yaml` — fixed Rollout
- `solutions/analysis-template.yaml` — working AnalysisTemplate
- `solutions/step-by-step-solution.md` — explanation of each fix
