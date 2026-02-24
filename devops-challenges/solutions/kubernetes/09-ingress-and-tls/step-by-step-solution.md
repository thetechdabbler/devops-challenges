# Solution — Ingress and TLS

## The Fixed Manifest

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devops-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx          # Fix 1
  tls:
    - hosts:
        - devops-app.local
      secretName: devops-app-tls   # Fix 4
  rules:
    - host: devops-app.local       # Fix 2
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

---

## Fixes Applied

### Fix 1: ingressClassName

Without `ingressClassName: nginx`, no controller picks up the Ingress. Multiple controllers can coexist (nginx, Traefik, Istio); the class name routes the Ingress to the right one.

Old clusters used the annotation `kubernetes.io/ingress.class: nginx`. Current Kubernetes uses the `ingressClassName` spec field.

### Fix 2: Local hostname

`myapp.example.com` doesn't resolve locally. For dev:
1. Use `devops-app.local` in the Ingress
2. Add `127.0.0.1 devops-app.local` to `/etc/hosts`

### Fix 3: pathType: Prefix is fine

The challenge listed this as a potential issue, but `Prefix` with path `/` correctly matches all requests. The `rewrite-target: /` annotation handles path stripping for subpaths.

### Fix 4: Create the TLS secret first

The Ingress references `secretName: devops-app-tls`. If the secret doesn't exist, the Ingress still applies but TLS won't work (nginx will use a default fake cert).

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "/CN=devops-app.local"
kubectl create secret tls devops-app-tls --key tls.key --cert tls.crt
```

---

## Verification

```bash
kubectl get ingress devops-app-ingress
# NAME                  CLASS   HOSTS              ADDRESS     PORTS     AGE
# devops-app-ingress    nginx   devops-app.local   localhost   80, 443   1m

curl -k https://devops-app.local/health
# {"status": "healthy"}

# Verbose — see TLS certificate details
curl -kv https://devops-app.local/ 2>&1 | grep -E "subject|issuer|SSL"
```

---

## Production Note

For production, use [cert-manager](https://cert-manager.io/) with Let's Encrypt for automated TLS:

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod

spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls   # cert-manager creates and renews this
```
