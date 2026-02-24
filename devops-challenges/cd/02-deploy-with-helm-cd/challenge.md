# Challenge — Deploy with Helm CD

## Scenario

Your team uses Helm to manage Kubernetes deployments. A CI/CD pipeline runs `helm upgrade` on every merge to `main`, but deployments are flaky — sometimes pods crash after deploy and nobody notices, failed deploys don't roll back, and the kubeconfig is embedded in plain YAML.

Fix the GitHub Actions workflow so Helm deployments are safe, observable, and secure.

## Your Task

The file `starter/cd.yml` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Missing `--install` flag** — `helm upgrade` fails on first deploy (chart not yet installed)
2. **No `--wait` flag** — pipeline exits immediately, not waiting for pods to be ready
3. **No `--timeout`** — pipeline hangs indefinitely if pods never become ready
4. **Kubeconfig in plain env var** — the raw kubeconfig is stored as an env var instead of a secret
5. **Missing `--atomic`** — failed deploys are not rolled back automatically

## Acceptance Criteria

- [ ] First-ever deploy succeeds (chart gets installed if it doesn't exist)
- [ ] Pipeline waits for all pods to reach `Running` state before reporting success
- [ ] Pipeline fails within 5 minutes if pods don't become ready
- [ ] A failed deploy automatically rolls back to the previous release
- [ ] Kubeconfig is read from a GitHub secret, not a hardcoded value

## Learning Notes

**Production-safe `helm upgrade` flags:**
```bash
helm upgrade devops-app ./chart \
  --install \        # install if release doesn't exist
  --wait \           # wait for all resources to be ready
  --timeout 5m \     # fail after 5 minutes
  --atomic \         # roll back on failure
  --namespace prod
```

**`--atomic` vs `--wait`:**
- `--wait` blocks until ready, then exits 0
- `--atomic` = `--wait` + automatic rollback if anything fails
- Use `--atomic` in production pipelines; it implies `--wait`

**Kubeconfig in GitHub Actions:**
```yaml
- name: Set up kubeconfig
  run: echo "${{ secrets.KUBECONFIG }}" > ~/.kube/config
```
