# Challenge — Deployments and Replicas

## Scenario

Your single Pod from exercise 01 has no self-healing. When the node goes down, so does your app. Your manager asks for high availability: the app should always have 3 running instances, auto-restart on failure, and allow zero-downtime deployments.

---

## Problems to Fix

The starter `deployment.yaml` has **five** issues:

1. `replicas` is set to 1 — should be 3 for high availability
2. `selector.matchLabels` does not match `template.metadata.labels` — the Deployment can't find its own Pods
3. The `strategy` field is missing — defaults to RollingUpdate but the maxUnavailable is too aggressive
4. The `minReadySeconds` field is missing — Kubernetes marks a pod "ready" the instant it starts, before it can actually serve traffic
5. No `resources` requests or limits — the scheduler can't make placement decisions

---

## Tasks

1. Fix all five issues in `deployment.yaml`
2. Apply it and verify 3 pods are running: `kubectl get pods`
3. Kill one pod and watch Kubernetes replace it: `kubectl delete pod <name>` then `watch kubectl get pods`
4. Scale to 5 replicas without editing the file: `kubectl scale deployment devops-app --replicas=5`
5. Scale back to 3 and verify
6. Inspect the ReplicaSet Kubernetes created: `kubectl get replicasets`

---

## Acceptance Criteria

- [ ] `kubectl get deployment devops-app` shows `READY 3/3`
- [ ] Deleting one pod results in a new pod starting automatically within 30 seconds
- [ ] `kubectl get replicaset` shows the ReplicaSet managing the pods
- [ ] `kubectl describe deployment devops-app` shows the rolling update strategy

---

## Learning Notes

### Deployment → ReplicaSet → Pod hierarchy

```
Deployment (manages rollout strategy)
  └── ReplicaSet (maintains desired replica count)
        └── Pod × N (actual running containers)
```

Never create ReplicaSets directly. Let Deployments manage them.

### selector must match template labels

```yaml
spec:
  selector:
    matchLabels:
      app: devops-app     # ← must match template labels exactly

  template:
    metadata:
      labels:
        app: devops-app   # ← must match selector exactly
```

A mismatch causes an immediate API error.

### Rolling update strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1    # at most 1 pod down at a time
    maxSurge: 1          # allow 1 extra pod above desired count
```

### Resources

```yaml
resources:
  requests:
    memory: "64Mi"   # scheduler uses this for placement
    cpu: "100m"      # 100 millicores = 0.1 CPU
  limits:
    memory: "128Mi"  # container killed if exceeded
    cpu: "500m"
```
