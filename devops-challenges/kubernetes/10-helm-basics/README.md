# 10 — Helm Basics

**Level**: Advanced | **Topic**: Kubernetes

Replace hand-edited YAML manifests with a Helm chart that works across dev, staging, and prod with per-environment overrides. Five issues to fix.

## Prerequisites

- Helm 3 installed: `brew install helm`

## Quick Start

```bash
# Validate the chart
helm lint starter/chart

# Try a dry-run install
helm install devops-app starter/chart --dry-run

# After fixing all issues:
helm install devops-app starter/chart
helm list

# Upgrade with prod values
helm upgrade devops-app starter/chart -f starter/chart/values-prod.yaml

# Inspect rendered templates
helm template devops-app starter/chart
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/10-helm-basics/`](../../../solutions/kubernetes/10-helm-basics/)
