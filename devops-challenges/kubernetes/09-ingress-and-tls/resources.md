# Resources — Ingress and TLS

## Setup Commands

```bash
# Install nginx ingress controller (Docker Desktop / kind)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# Wait for controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Generate self-signed TLS cert (dev only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=devops-app.local/O=DevOps Teacher"

# Create TLS secret
kubectl create secret tls devops-app-tls --key tls.key --cert tls.crt

# Add hosts entry (macOS/Linux)
echo "127.0.0.1 devops-app.local" | sudo tee -a /etc/hosts
```

## Ingress Manifest Reference

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devops-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - devops-app.local
      secretName: devops-app-tls
  rules:
    - host: devops-app.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: devops-app-svc
                port:
                  number: 80
```

## Useful Commands

```bash
kubectl get ingress
kubectl describe ingress <name>
kubectl get ingress <name> -o yaml

# Test with curl (skip cert validation for self-signed)
curl -k https://devops-app.local/health
curl -kv https://devops-app.local/   # verbose — shows TLS details
```

## Official Docs

- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Ingress controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)
- [nginx ingress controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager (for production TLS)](https://cert-manager.io/)
