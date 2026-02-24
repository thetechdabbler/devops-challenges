# Challenge — Rolling Updates and Rollbacks

## Scenario

Your app is live in production with 3 replicas. You need to deploy version `1.1.0` with zero downtime, then quickly roll back when the QA team reports that the new version breaks the `/config` endpoint.

---

## Problems to Fix

The starter `deployment.yaml` has **four** issues:

1. No `strategy` defined — default maxUnavailable is 25%, which for 3 replicas rounds to 1 (fine, but not explicit)
2. No `revisionHistoryLimit` — Kubernetes keeps 10 old ReplicaSets by default; set to 3
3. The image tag is `latest` — rollbacks are impossible without pinned tags
4. No `annotations` on the pod template — Kubernetes only rolls out when the spec changes; annotation-based change detection is a common pattern

---

## Tasks

1. Fix all four issues and deploy version `1.0.0`
2. Perform a rolling update to `1.1.0`: `kubectl set image deployment/devops-app app=devops-app:1.1.0`
3. Watch the rollout: `kubectl rollout status deployment/devops-app`
4. Rollback to `1.0.0`: `kubectl rollout undo deployment/devops-app`
5. View rollout history: `kubectl rollout history deployment/devops-app`
6. Roll back to a specific revision: `kubectl rollout undo deployment/devops-app --to-revision=1`

---

## Acceptance Criteria

- [ ] `kubectl rollout status deployment/devops-app` shows `successfully rolled out` after update
- [ ] During rollout, `kubectl get pods -w` shows new pods starting before old ones terminate
- [ ] `kubectl rollout undo` returns to the previous version within 60 seconds
- [ ] `kubectl rollout history` shows at least 2 revisions
- [ ] `kubectl get rs` shows only 3 old ReplicaSets (revisionHistoryLimit)

---

## Learning Notes

### Rolling update flow

```
Current: 3 pods at v1.0.0

1. Start 1 pod at v1.1.0 (maxSurge: 1 → now 4 total)
2. Wait for new pod to be ready
3. Terminate 1 pod at v1.0.0 (maxUnavailable: 1 → back to 3)
4. Repeat until all pods are v1.1.0
```

### Rollout commands

```bash
# Trigger rollout by updating image
kubectl set image deployment/<name> <container>=<image:tag>

# Monitor rollout
kubectl rollout status deployment/<name>

# Pause/resume (for canary-style manual control)
kubectl rollout pause deployment/<name>
kubectl rollout resume deployment/<name>

# View history
kubectl rollout history deployment/<name>
kubectl rollout history deployment/<name> --revision=2

# Rollback
kubectl rollout undo deployment/<name>
kubectl rollout undo deployment/<name> --to-revision=1
```

### Change-cause annotation

```yaml
metadata:
  annotations:
    kubernetes.io/change-cause: "deploy v1.1.0: add config endpoint"
```

This annotation appears in `kubectl rollout history` so you know what each revision changed.
