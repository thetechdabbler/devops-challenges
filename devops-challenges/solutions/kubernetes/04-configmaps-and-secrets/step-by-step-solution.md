# Solution — ConfigMaps and Secrets

## Fixes Applied

### Fix 1 & 2: Remove hardcoded env vars, use ConfigMap + Secret volume

```yaml
# Before
env:
  - name: APP_ENV
    value: production
  - name: DB_PASSWORD
    value: super-secret-password  # plaintext secret!

# After
envFrom:
  - configMapRef:
      name: app-config       # loads APP_ENV, APP_PORT, LOG_LEVEL
volumeMounts:
  - name: secrets
    mountPath: /run/secrets  # secret file at /run/secrets/db-password
    readOnly: true
```

### Fix 3: Use stringData in Secret

```yaml
# Before (broken — data: requires base64)
data:
  db-password: super-secret-password   # not valid base64

# After (stringData: accepts plaintext)
stringData:
  db-password: super-secret-password
```

Kubernetes automatically base64-encodes `stringData` values when storing in etcd.

### Fix 4: ConfigMap key naming

```yaml
# Before
data:
  app.env: production   # dot in key name breaks envFrom injection

# After
data:
  APP_ENV: production   # valid env var name
```

`envFrom: configMapRef` injects all keys as environment variables. Dots in key names produce invalid env var names that Python's `os.getenv` won't find.

### Fix 5: mountPath

```yaml
# Before
mountPath: /config

# After
mountPath: /run/secrets
```

The Flask app's `read_secret("db-password")` function looks in `/run/secrets/`. The mountPath must match what the code expects.

---

## Verification

```bash
kubectl apply -f configmap.yaml -f secret.yaml -f deployment.yaml

# ConfigMap injected as env vars
kubectl exec deploy/devops-app -- env | grep -E "APP_ENV|APP_PORT|LOG_LEVEL"

# Secret mounted as file
kubectl exec deploy/devops-app -- cat /run/secrets/db-password

# Decode secret value without exec
kubectl get secret app-secrets -o jsonpath='{.data.db-password}' | base64 -d
```
