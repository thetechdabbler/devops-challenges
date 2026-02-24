# Solution — Deployments and Replicas

## The Fixed Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devops-app
spec:
  replicas: 3                  # Fix 1: 3 for HA
  minReadySeconds: 10          # Fix 4: wait 10s before marking ready

  selector:
    matchLabels:
      app: devops-app          # Fix 2: matches template labels

  strategy:                    # Fix 3: explicit rolling update config
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1

  template:
    metadata:
      labels:
        app: devops-app
    spec:
      containers:
        - name: app
          image: devops-app:1.0.0
          ports:
            - containerPort: 5000
          resources:           # Fix 5: resource requests and limits
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "500m"
```

---

## Fixes Applied

### Fix 1: replicas: 3

With `replicas: 1`, any node failure or pod crash takes down the app. Three replicas tolerate one pod being unavailable (rolling update) and provide basic load distribution.

### Fix 2: selector/template label mismatch

The selector `matchLabels: { app: devops-backend }` doesn't match the pod template label `app: devops-app`. Kubernetes applies the manifest but the Deployment cannot find its pods — it will spin up new ones forever. Fix: make them identical.

### Fix 3: strategy

Without an explicit strategy, Kubernetes uses RollingUpdate with default settings: `maxUnavailable: 25%` and `maxSurge: 25%`. For 3 replicas, 25% rounds down to 0 unavailable and up to 1 surge — which is fine, but being explicit is better practice.

### Fix 4: minReadySeconds: 10

Kubernetes marks a pod "Ready" the instant its containers start, before the app is fully initialized. Setting `minReadySeconds: 10` adds a 10-second window where the pod must remain ready before it's counted as available. This prevents the rollout from proceeding with a pod that crashes 2 seconds after starting.

### Fix 5: resource requests and limits

The scheduler uses `requests` to decide which node can fit the pod. Without requests, pods may be placed on overloaded nodes. Without `limits`, a memory leak can consume all node memory.

---

## Verification

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/devops-app   # wait for complete

kubectl get pods        # 3 Running
kubectl get rs          # one active ReplicaSet

# Self-healing
kubectl delete pod $(kubectl get pods -l app=devops-app -o name | head -1)
kubectl get pods -w     # watch replacement start

# Scale
kubectl scale deployment devops-app --replicas=5
kubectl get pods        # 5 running
kubectl scale deployment devops-app --replicas=3
```
