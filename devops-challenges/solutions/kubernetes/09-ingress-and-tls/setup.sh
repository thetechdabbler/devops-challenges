#!/usr/bin/env bash
set -euo pipefail

# Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# Wait for controller
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Generate self-signed TLS certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/tls.key \
  -out /tmp/tls.crt \
  -subj "/CN=devops-app.local/O=DevOps Teacher"

# Create TLS secret
kubectl create secret tls devops-app-tls \
  --key /tmp/tls.key \
  --cert /tmp/tls.crt \
  --dry-run=client -o yaml | kubectl apply -f -

# Add hosts entry (requires sudo)
if ! grep -q "devops-app.local" /etc/hosts; then
  echo "127.0.0.1 devops-app.local" | sudo tee -a /etc/hosts
fi

echo "Setup complete. Apply the Ingress manifest:"
echo "  kubectl apply -f ingress.yaml"
echo ""
echo "Then test:"
echo "  curl -k https://devops-app.local/health"
