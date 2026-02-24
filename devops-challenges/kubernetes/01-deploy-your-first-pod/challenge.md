# Challenge — Deploy Your First Pod

## Scenario

You have a Docker image of the sample Flask app pushed to a registry. Your team is moving from `docker run` to Kubernetes. Your task: write a Pod manifest that runs the app, verify it starts, and understand what happens when it crashes.

---

## Problems to Fix

The starter `pod.yaml` has **five** intentional errors:

1. `apiVersion` is missing — all Kubernetes manifests require it
2. `kind` is set to `pod` (lowercase) — Kubernetes kinds are CamelCase
3. The container `image` tag is `latest` — not reproducible; pin to a specific tag
4. `containerPort` is missing — the app listens on 5000 but the manifest doesn't declare it
5. There is no `restartPolicy` — understand when to use `Never` vs `Always` vs `OnFailure`

---

## Tasks

1. Fix all five errors in `pod.yaml`
2. Apply the manifest: `kubectl apply -f pod.yaml`
3. Verify the pod is `Running`: `kubectl get pods`
4. Read the logs: `kubectl logs devops-app`
5. Port-forward and test the app: `kubectl port-forward pod/devops-app 8080:5000`
6. Delete the pod and observe it does NOT restart (restartPolicy: Never)
7. Change `restartPolicy` to `Always`, delete the pod process from inside, and observe it restart

---

## Acceptance Criteria

- [ ] `kubectl get pod devops-app` shows `STATUS: Running`
- [ ] `kubectl logs devops-app` shows Flask startup output
- [ ] `curl http://localhost:8080/health` returns `{"status": "healthy"}`
- [ ] `kubectl describe pod devops-app` shows no warning events
- [ ] You can explain the difference between `restartPolicy: Never`, `Always`, and `OnFailure`

---

## Learning Notes

### Pod vs Deployment

A Pod is the smallest deployable unit in Kubernetes — one or more containers sharing a network namespace and storage. Pods are ephemeral: if a node fails, the pod is gone. Deployments (exercise 02) add self-healing.

Use Pods directly only for:
- One-off jobs (`restartPolicy: Never`)
- Debugging (`kubectl run`)

Use Deployments for everything that should stay running.

### kubectl basics

```bash
kubectl apply -f pod.yaml          # create or update
kubectl get pods                   # list pods
kubectl describe pod <name>        # full details + events
kubectl logs <name>                # stdout/stderr
kubectl logs -f <name>             # follow logs
kubectl exec -it <name> -- sh     # shell into running pod
kubectl port-forward pod/<name> <local>:<pod>  # local access
kubectl delete pod <name>          # delete
kubectl delete -f pod.yaml         # delete by manifest
```

### Pod manifest anatomy

```yaml
apiVersion: v1           # API group/version
kind: Pod                # resource type (CamelCase)
metadata:
  name: my-pod           # unique name in namespace
  labels:                # key-value selectors
    app: my-app
spec:
  restartPolicy: Always  # Never | Always | OnFailure
  containers:
    - name: app          # container name
      image: repo/image:tag
      ports:
        - containerPort: 5000
      env:
        - name: APP_ENV
          value: production
```
