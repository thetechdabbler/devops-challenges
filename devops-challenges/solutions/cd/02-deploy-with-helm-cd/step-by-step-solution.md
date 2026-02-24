# Solution — Deploy with Helm CD

## Fixes Applied

### Fix 1: Add `--install`

```bash
# Before
helm upgrade devops-app ./chart

# After
helm upgrade devops-app ./chart --install
```

Without `--install`, `helm upgrade` fails with "Error: UPGRADE FAILED: release not found" on the very first run. `--install` makes it act as `helm install` when the release doesn't exist.

### Fix 2 & 3: Add `--atomic` and `--timeout`

```bash
# After
helm upgrade devops-app ./chart --install --atomic --timeout 5m
```

`--atomic` implies `--wait` (waits for all pods to be Ready) and additionally rolls back automatically if anything fails. `--timeout 5m` prevents infinite hangs.

### Fix 4: Use GitHub Secret for Kubeconfig

```yaml
# Before
env:
  KUBECONFIG_DATA: "apiVersion: v1\nclusters:..."

# After
- name: Configure kubeconfig
  run: |
    mkdir -p ~/.kube
    echo "${{ secrets.KUBECONFIG }}" > ~/.kube/config
    chmod 600 ~/.kube/config
```

Storing kubeconfig in `env:` at the workflow level exposes it in logs and to all jobs. GitHub Secrets are encrypted at rest and masked in logs.

### Fix 5: `--atomic` covers rollback

`--atomic` = `--wait` + automatic rollback on failure. If any resource fails to become Ready within the timeout, Helm rolls back to the last successful release and exits non-zero, failing the pipeline step.

---

## Result

- First deploy succeeds via `--install`
- Pipeline blocks until all pods are Running
- Failed deploys auto-rollback within 5 minutes
- Kubeconfig is kept out of logs and workflow YAML
