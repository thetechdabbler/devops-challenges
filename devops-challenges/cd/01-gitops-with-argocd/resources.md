# Resources — GitOps with ArgoCD

## ArgoCD Application Spec Reference

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/repo
    targetRevision: HEAD
    path: k8s/
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true       # delete resources removed from Git
      selfHeal: true    # revert out-of-band cluster changes
    syncOptions:
      - CreateNamespace=true
```

## Common ArgoCD CLI Commands

```bash
# Install ArgoCD (local dev)
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Port-forward UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login
argocd login localhost:8080

# App operations
argocd app list
argocd app get <name>
argocd app sync <name>
argocd app history <name>
argocd app rollback <name> <revision>
argocd app delete <name>
```

## Sync Status Values

| Status | Meaning |
|--------|---------|
| `Synced` | Cluster matches Git |
| `OutOfSync` | Drift detected |
| `Unknown` | Cannot determine state |
| `Progressing` | Sync in progress |

## Health Status Values

| Status | Meaning |
|--------|---------|
| `Healthy` | All resources ready |
| `Degraded` | Resources failing |
| `Suspended` | Paused by user |
| `Missing` | Resource not found |

## Official Docs

- [ArgoCD Application CRD](https://argo-cd.readthedocs.io/en/stable/user-guide/application-specification/)
- [Automated Sync Policy](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/)
- [GitOps patterns](https://argo-cd.readthedocs.io/en/stable/operator-manual/gitops-engine/)
