# Solution — Deploy Your First Pod

## The Fixed Manifest

```yaml
apiVersion: v1           # Fix 1: added apiVersion
kind: Pod                # Fix 2: CamelCase kind
metadata:
  name: devops-app
  labels:
    app: devops-app
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: devops-app:1.0.0   # Fix 3: pinned tag
      ports:
        - containerPort: 5000    # Fix 4: declared port
      env:
        - name: APP_ENV
          value: development
```

---

## Fixes Applied

### Fix 1: apiVersion

Every Kubernetes manifest needs `apiVersion`. For core resources (Pod, Service, ConfigMap) it's `v1`. Other API groups use `apps/v1`, `networking.k8s.io/v1`, etc.

### Fix 2: Kind CamelCase

Kubernetes kinds are always CamelCase: `Pod`, not `pod`. The API server rejects unknown kinds.

### Fix 3: Pin the image tag

`latest` is resolved at pull time — two builds can produce different images. In a team, this means different cluster nodes may run different versions. Always pin: `image: devops-app:1.0.0`.

### Fix 4: containerPort

`containerPort` is documentation (it doesn't actually open the port — Kubernetes networking exposes all container ports). But it's required for Services to auto-discover the port, and it signals intent to future readers.

---

## Testing

```bash
kubectl apply -f pod.yaml
kubectl get pods                           # wait for Running
kubectl logs devops-app                    # Flask startup
kubectl port-forward pod/devops-app 8080:5000 &
curl http://localhost:8080/health          # {"status": "healthy"}
curl http://localhost:8080/               # hello

# Observe restartPolicy: Never
kubectl exec devops-app -- kill 1         # kill the Flask process
kubectl get pods                           # status: Completed (not restarted)

# Change to Always and repeat
kubectl delete pod devops-app
# edit restartPolicy: Always in pod.yaml
kubectl apply -f pod.yaml
kubectl exec devops-app -- kill 1
kubectl get pods                           # restarts automatically
```
