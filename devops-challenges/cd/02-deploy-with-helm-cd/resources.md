# Resources — Deploy with Helm CD

## Production-Safe helm upgrade Pattern

```bash
helm upgrade <release> <chart> \
  --install \          # install if not exists
  --atomic \           # wait + rollback on failure
  --timeout 5m \       # max wait time
  --namespace <ns> \
  --create-namespace \
  -f values.yaml \
  -f values-prod.yaml \
  --set image.tag=$IMAGE_TAG
```

## Helm Release Management Commands

```bash
# List releases
helm list -A

# Check release status
helm status devops-app -n prod

# View release history
helm history devops-app -n prod

# Manual rollback
helm rollback devops-app 2 -n prod

# Uninstall
helm uninstall devops-app -n prod
```

## Kubeconfig in GitHub Actions

```yaml
# Option 1: Raw kubeconfig as secret
- run: |
    mkdir -p ~/.kube
    echo "${{ secrets.KUBECONFIG }}" > ~/.kube/config
    chmod 600 ~/.kube/config

# Option 2: azure/k8s-set-context action
- uses: azure/k8s-set-context@v3
  with:
    method: kubeconfig
    kubeconfig: ${{ secrets.KUBECONFIG }}
```

## --atomic vs --wait vs Nothing

| Flag | Waits? | Rolls back on fail? |
|------|--------|---------------------|
| (none) | No | No |
| `--wait` | Yes | No |
| `--atomic` | Yes | Yes |

## Official Docs

- [helm upgrade flags](https://helm.sh/docs/helm/helm_upgrade/)
- [GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [azure/k8s-set-context](https://github.com/Azure/k8s-set-context)
