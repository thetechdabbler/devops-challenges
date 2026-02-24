# Resources — Deploy Your First Pod

## Essential kubectl Commands

```bash
# Cluster info
kubectl cluster-info
kubectl get nodes

# Pod lifecycle
kubectl apply -f pod.yaml
kubectl get pods
kubectl get pods -o wide          # show node, IP
kubectl get pods -w               # watch for changes
kubectl describe pod <name>       # events, status, mounts
kubectl logs <name>
kubectl logs <name> -f            # follow
kubectl logs <name> --previous    # logs from crashed container
kubectl exec -it <name> -- sh
kubectl port-forward pod/<name> <local>:<pod>
kubectl delete pod <name>

# Validate manifest before applying
kubectl apply -f pod.yaml --dry-run=client
kubectl apply -f pod.yaml --dry-run=server   # requires cluster connection
```

## Pod Manifest Reference

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  namespace: default      # omit to use default
  labels:
    app: my-app
    version: "1.0.0"
spec:
  restartPolicy: Always   # Never | Always | OnFailure
  containers:
    - name: app
      image: myrepo/myimage:1.0.0
      ports:
        - containerPort: 5000
          protocol: TCP
      env:
        - name: APP_ENV
          value: production
      resources:
        requests:
          memory: "64Mi"
          cpu: "100m"
        limits:
          memory: "128Mi"
          cpu: "500m"
```

## restartPolicy Values

| Policy | Behaviour |
|--------|-----------|
| `Always` | Always restart (default for Deployments) |
| `OnFailure` | Restart only on non-zero exit (Jobs) |
| `Never` | Never restart (one-off tasks, debugging) |

## Official Docs

- [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
- [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [API reference — Pod](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/)
