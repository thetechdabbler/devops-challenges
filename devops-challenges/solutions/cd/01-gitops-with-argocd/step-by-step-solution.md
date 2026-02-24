# Solution — GitOps with ArgoCD

## Fixes Applied

### Fix 1: API Version

```yaml
# Before
apiVersion: argoproj.io/v1

# After
apiVersion: argoproj.io/v1alpha1
```

ArgoCD's CRDs are registered under `v1alpha1`. Using `v1` causes `kubectl apply` to fail with "no matches for kind Application".

### Fix 2: Destination Server

```yaml
# Before
server: local

# After
server: https://kubernetes.default.svc
```

`https://kubernetes.default.svc` is the in-cluster Kubernetes API server URL. This is correct for deployments to the same cluster ArgoCD runs in. For external clusters, use the cluster's API endpoint and register it with `argocd cluster add`.

### Fix 3: Automated Sync Block

```yaml
syncPolicy:
  automated:        # ← this block was missing
    prune: true
    selfHeal: true
```

Without `automated:`, ArgoCD only syncs when you manually trigger it. Adding this block enables the GitOps loop.

### Fix 4: Prune Enabled

```yaml
# Before
prune: false

# After
prune: true
```

`prune: true` tells ArgoCD to delete cluster resources that no longer exist in Git. Without it, deleted YAML files leave zombie resources in the cluster.

### Fix 5: Self-Heal Enabled

```yaml
# Before
selfHeal: false

# After
selfHeal: true
```

`selfHeal: true` makes ArgoCD watch for out-of-band changes (e.g., someone runs `kubectl edit`) and automatically reverts them to match Git. This is the core of GitOps discipline.

---

## Result

After applying the fixed manifest:
- `argocd app get devops-app` shows `Synced` + `Healthy`
- Pushing to Git triggers automatic sync within ~3 minutes
- Deleting a resource from Git prunes it from the cluster
- Manual `kubectl edit` changes are reverted automatically
