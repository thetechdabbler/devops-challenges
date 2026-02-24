# 09 — Ingress and TLS

**Level**: Advanced | **Topic**: Kubernetes

Replace a NodePort Service with an Ingress that terminates TLS and routes traffic by hostname. Five issues to fix.

## Prerequisites

- nginx Ingress controller installed (see challenge.md task 1)
- `openssl` for generating a self-signed certificate
- `/etc/hosts` entry: `127.0.0.1 devops-app.local`

## Quick Start

```bash
# Install ingress-nginx (Docker Desktop)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# Generate TLS cert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "/CN=devops-app.local"
kubectl create secret tls devops-app-tls --key tls.key --cert tls.crt

# Fix and apply the Ingress
kubectl apply -f starter/ingress.yaml
curl -k https://devops-app.local/health
```

See [`challenge.md`](./challenge.md) for all tasks and acceptance criteria.

## Solution

[`solutions/kubernetes/09-ingress-and-tls/`](../../../solutions/kubernetes/09-ingress-and-tls/)
