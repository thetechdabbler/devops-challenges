# Resources — Canary Releases

## Argo Rollouts kubectl Plugin

```bash
# Install plugin
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-darwin-amd64
chmod +x kubectl-argo-rollouts-darwin-amd64
mv kubectl-argo-rollouts-darwin-amd64 /usr/local/bin/kubectl-argo-rollouts

# Rollout operations
kubectl argo rollouts get rollout devops-app --watch
kubectl argo rollouts promote devops-app      # manually promote
kubectl argo rollouts abort devops-app        # abort and rollback
kubectl argo rollouts undo devops-app         # rollback to previous
kubectl argo rollouts set image devops-app app=devops-app:1.2.0
```

## Canary Strategy Fields

```yaml
strategy:
  canary:
    maxSurge: "25%"      # extra pods allowed during rollout
    maxUnavailable: 0    # always keep full capacity
    steps:
      - setWeight: 10
      - pause: {duration: 2m}
      - analysis:
          templates:
            - templateName: success-rate
      - setWeight: 50
      - pause: {duration: 5m}
```

## AnalysisTemplate Providers

- Prometheus (metric queries)
- Datadog
- New Relic
- Web (HTTP endpoint check)
- Job (run a Kubernetes Job for custom checks)

## Official Docs

- [Argo Rollouts concepts](https://argo-rollouts.readthedocs.io/en/stable/concepts/)
- [Canary strategy](https://argo-rollouts.readthedocs.io/en/stable/features/canary/)
- [Analysis and experiments](https://argo-rollouts.readthedocs.io/en/stable/features/analysis/)
