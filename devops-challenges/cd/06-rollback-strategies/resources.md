# Resources — Rollback Strategies

## kubectl rollout Commands

```bash
# View deployment rollout history
kubectl rollout history deployment/devops-app -n prod

# View a specific revision
kubectl rollout history deployment/devops-app --revision=3 -n prod

# Roll back to previous version
kubectl rollout undo deployment/devops-app -n prod

# Roll back to specific revision
kubectl rollout undo deployment/devops-app --to-revision=2 -n prod

# Wait for rollout/rollback to complete
kubectl rollout status deployment/devops-app -n prod --timeout=3m

# Pause/resume a rollout
kubectl rollout pause deployment/devops-app -n prod
kubectl rollout resume deployment/devops-app -n prod
```

## Deployment Revision Tracking

Enable revision history by setting `revisionHistoryLimit` in your Deployment:
```yaml
spec:
  revisionHistoryLimit: 5   # keep last 5 ReplicaSets for rollback
```

## Rollback Job Pattern

```yaml
rollback:
  needs: deploy
  if: failure()
  runs-on: ubuntu-latest
  steps:
    - name: Configure kubeconfig
      run: |
        mkdir -p ~/.kube
        echo "${{ secrets.KUBECONFIG }}" > ~/.kube/config

    - name: Roll back
      run: |
        kubectl rollout undo deployment/${{ env.APP_NAME }} -n prod
        kubectl rollout status deployment/${{ env.APP_NAME }} -n prod --timeout=3m

    - name: Notify rollback
      run: |
        curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
          -d '{"text":":rewind: Rollback triggered for ${{ github.sha }}"}'
      continue-on-error: true
```

## Official Docs

- [kubectl rollout](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/)
- [Deployment rollback](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment)
