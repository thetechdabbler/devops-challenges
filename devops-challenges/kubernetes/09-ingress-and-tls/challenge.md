# Challenge — Ingress and TLS

## Scenario

Your app is exposed on `NodePort: 30080` — a non-standard port that your company's firewall blocks. You need to expose it on standard port 443 with a TLS certificate, route traffic for multiple apps to different Services based on hostname, and terminate TLS at the cluster edge rather than inside each app.

---

## Problems to Fix

The starter `ingress.yaml` has **five** issues:

1. `ingressClassName` is missing — the Ingress won't be picked up by any controller
2. The `host` is `myapp.example.com` — for local dev, use `devops-app.local`
3. The `pathType` is `Prefix` but the path `/api` doesn't have a trailing slash rewrite annotation — causes routing issues
4. The TLS secret name `tls-secret` doesn't exist — needs to be created first
5. The backend `servicePort` references port `80` but the Service uses port `80` internally — this one is actually correct; verify the service name matches

---

## Tasks

1. Install an Ingress controller (nginx): `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml`
2. Generate a self-signed TLS certificate and create the Secret
3. Fix all five issues in `ingress.yaml`
4. Add your hostname to `/etc/hosts`: `127.0.0.1 devops-app.local`
5. Test HTTPS access: `curl -k https://devops-app.local/health`

---

## Acceptance Criteria

- [ ] `kubectl get ingress devops-app-ingress` shows an ADDRESS
- [ ] `curl -k https://devops-app.local/health` returns `{"status": "healthy"}`
- [ ] `curl -k https://devops-app.local/` routes to the main app
- [ ] `kubectl describe ingress devops-app-ingress` shows the TLS secret

---

## Learning Notes

### Ingress vs Service

```
Internet → Ingress (L7 routing, TLS termination)
              ├── /api → api-service:80
              └── /    → app-service:80
```

An Ingress is a rule set. An Ingress Controller (nginx, Traefik, Istio) is the actual proxy that reads those rules and implements them.

### Ingress manifest

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

### Creating a TLS Secret

```bash
# Generate self-signed cert (for dev only)
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=devops-app.local"

# Create the Kubernetes Secret
kubectl create secret tls devops-app-tls \
  --key tls.key \
  --cert tls.crt
```
