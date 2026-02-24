# Solution — Services and Networking

## The Fixed Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: devops-app-svc
spec:
  type: NodePort           # Fix 3: was ClusterIP
  selector:
    app: devops-app        # Fix 1: matches pod labels
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 5000     # Fix 2: added targetPort
      nodePort: 30080      # Fix 4: explicit NodePort
```

---

## Fixes Applied

### Fix 1: selector matches pod labels

The Deployment creates pods with label `app: devops-app`. The Service must use the same selector. A mismatched selector creates a Service with zero Endpoints — traffic has nowhere to go.

```bash
kubectl get endpoints devops-app-svc
# Before fix: devops-app-svc   <none>  (no endpoints)
# After fix:  devops-app-svc   10.1.0.5:5000,10.1.0.6:5000,10.1.0.7:5000
```

### Fix 2: targetPort

`port: 80` is the Service's own port — what other pods in the cluster use to reach the Service.
`targetPort: 5000` is the container port — where the Flask app actually listens.

Without `targetPort`, Kubernetes tries to forward to port 80 inside the container, which returns "connection refused."

### Fix 3: type: NodePort

`ClusterIP` services are only reachable from inside the cluster. For local development, `NodePort` exposes the Service on a static port on every cluster node's IP. Docker Desktop maps the node's IP to localhost.

### Fix 4: explicit nodePort

Without an explicit `nodePort`, Kubernetes assigns a random port in the 30000–32767 range — unpredictable for documentation and scripts. Specifying `30080` makes it deterministic.

---

## Verification

```bash
kubectl get svc devops-app-svc        # shows 80:30080/TCP
kubectl get endpoints devops-app-svc  # shows 3 pod IPs
curl http://localhost:30080/health    # {"status": "healthy"}

# Internal cluster access
kubectl run tmp --rm -it --image=curlimages/curl \
  -- curl http://devops-app-svc/health
```
