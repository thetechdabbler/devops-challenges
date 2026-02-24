# Resources — Persistent Storage

## Useful Commands

```bash
# PVC and PV
kubectl get pvc
kubectl describe pvc <name>
kubectl get pv

# Storage classes (what types of storage are available)
kubectl get storageclass

# Watch PVC bind
kubectl get pvc -w

# Test persistence
kubectl exec deploy/<name> -- sh -c "echo test > /app/uploads/test.txt"
kubectl delete pod $(kubectl get pods -l app=<selector> -o name | head -1)
kubectl exec deploy/<name> -- cat /app/uploads/test.txt
```

## PVC Manifest

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-uploads
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  # storageClassName: standard   # omit to use cluster default
```

## Volume Mount in Deployment

```yaml
spec:
  volumes:
    - name: uploads
      persistentVolumeClaim:
        claimName: app-uploads
  containers:
    - name: app
      volumeMounts:
        - name: uploads
          mountPath: /app/uploads
```

## Access Modes by Cloud Provider

| Provider | ReadWriteOnce | ReadWriteMany |
|----------|--------------|--------------|
| Docker Desktop | hostPath | Not supported |
| AWS | gp2/gp3 (EBS) | EFS |
| GCP | pd-standard | Filestore |
| Azure | Azure Disk | Azure Files |

## Official Docs

- [PersistentVolumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [Storage classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)
