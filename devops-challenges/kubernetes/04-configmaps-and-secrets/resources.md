# Resources — ConfigMaps and Secrets

## Useful Commands

```bash
# ConfigMap
kubectl apply -f configmap.yaml
kubectl get configmaps
kubectl get cm                         # shorthand
kubectl describe cm app-config
kubectl get cm app-config -o yaml      # view full content

# Secret
kubectl apply -f secret.yaml
kubectl get secrets
kubectl describe secret app-secrets    # shows metadata only, not values
kubectl get secret app-secrets -o jsonpath='{.data.db-password}' | base64 -d  # decode value

# Create from command line
kubectl create configmap app-config --from-literal=APP_ENV=production
kubectl create secret generic app-secrets --from-literal=db-password=mypassword

# Verify injection in pod
kubectl exec deploy/<name> -- env
kubectl exec deploy/<name> -- cat /run/secrets/db-password
```

## ConfigMap Manifest

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

## Secret Manifest

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:            # plaintext — Kubernetes base64-encodes automatically
  db-password: mypassword
# OR use data: with pre-encoded values
data:
  db-password: bXlwYXNzd29yZA==   # echo -n "mypassword" | base64
```

## Consuming in Deployments

```yaml
# Option 1: All ConfigMap keys as env vars
envFrom:
  - configMapRef:
      name: app-config

# Option 2: Specific keys
env:
  - name: APP_ENV
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_ENV

# Option 3: Secret as mounted file (recommended for secrets)
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

## Official Docs

- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Configure a pod to use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)
