# Challenge — Persistent Storage

## Scenario

Your app writes uploaded files to `/app/uploads`. Everything works — until you roll out a new version. The new pods start fresh with empty `/app/uploads` because container filesystems are ephemeral. You need persistent storage that survives pod restarts and rollouts.

---

## Problems to Fix

The starter files have **four** issues:

1. The Deployment writes to `/app/uploads` but has no volume mount — data is lost on pod restart
2. The `PersistentVolumeClaim` has `accessMode: ReadWriteMany` — for a local cluster, this isn't supported; use `ReadWriteOnce`
3. The PVC storage request `100Gi` is too large for a local development cluster; use `1Gi`
4. The volume mount is missing `subPath` — multiple pods would overwrite each other's data

---

## Tasks

1. Create a PersistentVolumeClaim for 1Gi of storage with `ReadWriteOnce` access
2. Mount the PVC into the Deployment at `/app/uploads`
3. Write a file from inside one pod
4. Delete the pod and verify the file persists in the new pod
5. Inspect the PersistentVolume that Kubernetes automatically provisioned

---

## Acceptance Criteria

- [ ] `kubectl get pvc app-uploads` shows `STATUS: Bound`
- [ ] `kubectl exec <pod> -- ls /app/uploads` shows the directory
- [ ] After writing a file and deleting the pod, the file is still present in the new pod
- [ ] `kubectl get pv` shows the auto-provisioned PersistentVolume

---

## Learning Notes

### Storage hierarchy

```
StorageClass (defines the type of storage)
  └── PersistentVolume (PV) — the actual storage resource
        └── PersistentVolumeClaim (PVC) — a request for storage
              └── Pod volume mount — uses the PVC
```

On local clusters (Docker Desktop, minikube), a `StorageClass` called `standard` or `hostpath` automatically provisions local disk storage.

### PVC manifest

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-uploads
spec:
  accessModes:
    - ReadWriteOnce   # RWO: one node at a time; RWX: many nodes
  resources:
    requests:
      storage: 1Gi
  # storageClassName: standard   # omit to use cluster default
```

### Access modes

| Mode | Meaning |
|------|---------|
| `ReadWriteOnce` (RWO) | One node can read/write — local disk, EBS |
| `ReadOnlyMany` (ROX) | Many nodes can read |
| `ReadWriteMany` (RWX) | Many nodes can read/write — NFS, EFS |

### Volume mount in Deployment

```yaml
spec:
  volumes:
    - name: uploads
      persistentVolumeClaim:
        claimName: app-uploads
  containers:
    - volumeMounts:
        - name: uploads
          mountPath: /app/uploads
```
