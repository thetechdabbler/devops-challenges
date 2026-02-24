# Resources — Services and Networking

## Useful Commands

```bash
# Services
kubectl apply -f service.yaml
kubectl get services
kubectl get svc                        # shorthand
kubectl describe svc <name>
kubectl get endpoints <name>           # shows pod IPs behind the service

# Test connectivity inside cluster
kubectl run tmp --rm -it --image=curlimages/curl -- curl http://<service-name>:<port>/health

# Delete
kubectl delete svc <name>
kubectl delete -f service.yaml
```

## Service Manifest Reference

```yaml
apiVersion: v1
kind: Service
metadata:
  name: devops-app-svc
spec:
  type: NodePort         # ClusterIP | NodePort | LoadBalancer | ExternalName

  selector:
    app: devops-app      # must match pod labels

  ports:
    - name: http
      protocol: TCP
      port: 80           # service port (internal cluster)
      targetPort: 5000   # container port
      nodePort: 30080    # node port (NodePort type only; 30000-32767)
```

## Service Types

```
ClusterIP (default):   cluster-internal only
NodePort:              <NodeIP>:<nodePort>  — for local dev / bare metal
LoadBalancer:          provisions cloud LB  — for AWS/GCP/Azure
ExternalName:          CNAME alias          — for external services
```

## DNS for Services

Kubernetes DNS resolves services within the cluster:

```
<service-name>                       # same namespace
<service-name>.<namespace>           # different namespace
<service-name>.<namespace>.svc.cluster.local  # fully qualified
```

From one pod to another:
```bash
curl http://devops-app-svc/health          # same namespace
curl http://devops-app-svc.default/health  # cross-namespace
```

## Official Docs

- [Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [DNS for services and pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
