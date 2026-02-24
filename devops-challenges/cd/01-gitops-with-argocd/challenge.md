# Challenge — GitOps with ArgoCD

## Scenario

Your team has adopted GitOps using ArgoCD. A colleague wrote the initial ArgoCD Application manifest to deploy `devops-app` to your cluster, but the app never syncs — it shows `Unknown` status and ArgoCD throws errors on every refresh.

You've been asked to fix the manifest so the application syncs automatically, prunes orphaned resources, and self-heals when cluster state drifts.

## Your Task

The file `starter/application.yaml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong API version** — The `apiVersion` is incorrect for ArgoCD resources
2. **Bad destination server** — The cluster destination is not a valid Kubernetes API server URL
3. **Missing automated sync** — The `syncPolicy` block exists but automated sync is not enabled
4. **Prune disabled** — Orphaned resources won't be deleted when removed from Git
5. **Self-heal disabled** — Cluster drift won't be corrected automatically

## Acceptance Criteria

- [ ] `kubectl apply -f application.yaml` succeeds without errors
- [ ] ArgoCD shows the app as `Synced` and `Healthy`
- [ ] Removing a resource from Git causes it to be deleted from the cluster
- [ ] Manually editing a resource in the cluster triggers an automatic revert
- [ ] `argocd app get devops-app` shows `Auto-Sync: enabled`

## Learning Notes

**ArgoCD Application anatomy:**
```
apiVersion: argoproj.io/v1alpha1   ← always v1alpha1, not v1
kind: Application
spec:
  destination:
    server: https://kubernetes.default.svc   ← in-cluster server URL
  syncPolicy:
    automated:
      prune: true      ← delete removed resources
      selfHeal: true   ← revert manual changes
```

**The GitOps loop:**
1. Developer pushes to Git
2. ArgoCD detects diff between Git state and cluster state
3. ArgoCD syncs — applies missing resources, prunes orphaned ones
4. selfHeal watches for out-of-band cluster changes and reverts them

**Key commands:**
```bash
argocd app get devops-app
argocd app sync devops-app
argocd app history devops-app
kubectl get applications -n argocd
```
