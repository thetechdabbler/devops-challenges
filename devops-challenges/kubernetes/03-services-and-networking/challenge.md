# Challenge — Services and Networking

## Scenario

Your 3-replica Deployment is running but inaccessible. Pods have ephemeral IPs that change on every restart. You need a stable endpoint that load-balances across all healthy pods and is accessible from outside the cluster.

---

## Problems to Fix

The starter `service.yaml` has **four** issues:

1. `selector` doesn't match the Deployment's pod labels — the Service has no endpoints
2. `targetPort` is missing — the Service doesn't know which port to forward traffic to
3. The Service `type` is `ClusterIP` — inaccessible from outside; should be `NodePort` for local clusters
4. The `nodePort` value `30000` is outside the valid range (must be 30000–32767, but it conflicts with common defaults) — use an explicit unused port

---

## Tasks

1. Fix all four issues in `service.yaml`
2. Apply the Deployment from exercise 02, then apply the Service
3. Verify the Service has endpoints: `kubectl get endpoints devops-app-svc`
4. Access the app through the NodePort: `curl http://localhost:<nodePort>/health`
5. Scale the Deployment to 5 replicas and verify load balancing by checking pod logs
6. Create a second Service of type `ClusterIP` for internal cluster access

---

## Acceptance Criteria

- [ ] `kubectl get service devops-app-svc` shows a NodePort with an assigned port
- [ ] `kubectl get endpoints devops-app-svc` shows 3 IP:port entries (one per pod)
- [ ] `curl http://localhost:<nodePort>/health` returns `{"status": "healthy"}`
- [ ] After scaling to 5 replicas, `kubectl get endpoints` shows 5 entries

---

## Learning Notes

### Service types

| Type | Accessibility |
|------|--------------|
| `ClusterIP` | Only within the cluster (default) |
| `NodePort` | Exposed on every node's IP at a static port (30000–32767) |
| `LoadBalancer` | Provisions a cloud load balancer (AWS/GCP/Azure) |
| `ExternalName` | DNS alias to an external service |

### Service manifest anatomy

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-svc
spec:
  type: NodePort
  selector:
    app: devops-app   # must match pod labels
  ports:
    - name: http
      port: 80           # Service port (cluster-internal)
      targetPort: 5000   # container port
      nodePort: 30080    # external port on node (NodePort only)
```

### How Services find Pods

The Service controller watches all pods matching the `selector`. It adds healthy pod IPs to the `Endpoints` object. When a request arrives, kube-proxy load-balances across all endpoint IPs using iptables rules.

```bash
# See which pods the service routes to
kubectl get endpoints <service-name>
```
