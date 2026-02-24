# Solution — Persistent Storage

## The Fixed Files

**pvc.yaml:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-uploads
spec:
  accessModes:
    - ReadWriteOnce   # Fix 2: RWO for local cluster
  resources:
    requests:
      storage: 1Gi    # Fix 3: appropriate for dev
```

**deployment.yaml (key additions):**
```yaml
spec:
  volumes:
    - name: uploads
      persistentVolumeClaim:
        claimName: app-uploads    # Fix 1: volume defined
  containers:
    - volumeMounts:
        - name: uploads
          mountPath: /app/uploads
          subPath: uploads        # Fix 4: isolates this app's data
```

---

## Fixes Applied

### Fix 1: Add volumes and volumeMounts

A PVC alone does nothing. The Deployment must declare a `volume` referencing the PVC and mount it into the container at the desired path.

### Fix 2: ReadWriteOnce

Local storage (hostPath on Docker Desktop, minikube) only supports `ReadWriteOnce` — one node at a time. `ReadWriteMany` requires a networked filesystem (NFS, EFS). Requesting RWX on a cluster that doesn't support it leaves the PVC stuck in `Pending`.

### Fix 3: 1Gi storage request

`100Gi` may exceed what the local cluster can provision. For development, 1Gi is sufficient.

### Fix 4: subPath

Without `subPath`, the entire PVC root is mounted at `/app/uploads`. With `subPath: uploads`, only the `uploads/` subdirectory within the PVC is mounted. This matters when a single PVC is shared across multiple apps.

---

## Verification

```bash
kubectl apply -f pvc.yaml
kubectl get pvc                      # STATUS: Bound

kubectl apply -f deployment.yaml
kubectl exec deploy/devops-app -- sh -c "echo persistent > /app/uploads/test.txt"

# Delete pod — new pod starts with same PVC
kubectl delete pod $(kubectl get pods -l app=devops-app -o name | head -1)
kubectl exec deploy/devops-app -- cat /app/uploads/test.txt   # still "persistent"

# Inspect the auto-provisioned PV
kubectl get pv
kubectl describe pv <name>
```
