# Challenge — ConfigMaps and Secrets

## Scenario

Your app configuration is baked into the Deployment manifest as hardcoded `env` values. Every config change requires rebuilding the image or editing a manifest that also contains security-sensitive data. Your team wants to externalize configuration and separate secrets from non-sensitive config.

---

## Problems to Fix

The starter files have **five** issues:

1. The Deployment has hardcoded `env:` values — should reference a ConfigMap
2. The database password is in plaintext in the Deployment manifest — should use a Secret
3. The Secret in `secret.yaml` stores the password as plaintext, not base64
4. The ConfigMap `data` key `app.env` should be `APP_ENV` (env var naming convention)
5. The volume mount path for the config file is wrong — should be `/etc/config` not `/config`

---

## Tasks

1. Fix all five issues in the starter files
2. Apply: `kubectl apply -f configmap.yaml -f secret.yaml -f deployment.yaml`
3. Verify the app reads the ConfigMap: `kubectl exec <pod> -- env | grep APP_ENV`
4. Verify the secret is mounted as a file: `kubectl exec <pod> -- cat /run/secrets/db-password`
5. Update the ConfigMap value and roll out the Deployment to pick up the change

---

## Acceptance Criteria

- [ ] `kubectl get configmap app-config` exists with the correct key-value pairs
- [ ] `kubectl get secret app-secrets` exists
- [ ] `kubectl exec <pod> -- env | grep APP_ENV` returns `production`
- [ ] `kubectl exec <pod> -- cat /run/secrets/db-password` returns the password value
- [ ] No passwords appear in the Deployment manifest

---

## Learning Notes

### ConfigMap — for non-sensitive config

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  APP_PORT: "5000"
  LOG_LEVEL: info
```

Use as env vars:
```yaml
envFrom:
  - configMapRef:
      name: app-config
```

Or reference individual keys:
```yaml
env:
  - name: APP_ENV
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_ENV
```

### Secret — for sensitive data

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  db-password: <base64-encoded-value>   # echo -n "mypassword" | base64
stringData:
  db-password: mypassword   # stringData accepts plaintext (Kubernetes encodes it)
```

Mount as a file (recommended):
```yaml
volumes:
  - name: secrets
    secret:
      secretName: app-secrets
containers:
  - volumeMounts:
      - name: secrets
        mountPath: /run/secrets
        readOnly: true
```

### Note on Kubernetes Secrets

Kubernetes Secrets are base64-encoded, not encrypted at rest by default. For production, enable etcd encryption or use an external secret store (AWS Secrets Manager, HashiCorp Vault).
