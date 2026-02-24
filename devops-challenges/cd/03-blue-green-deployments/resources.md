# Resources — Blue-Green Deployments

## Blue-Green Pattern

```
 ┌─────────────────────────────────────────────────┐
 │  Production Service (selector: version=active)  │
 └──────────────────┬──────────────────────────────┘
                    │ routes to active color
         ┌──────────┴──────────┐
         ▼                     ▼
  ┌─────────────┐       ┌─────────────┐
  │  Blue Pods  │       │  Green Pods │
  │  v1.0.0     │       │  v1.1.0     │  ← new version
  └─────────────┘       └─────────────┘
  (label: blue)         (label: green)
```

## Key Kubernetes Commands

```bash
# Check which pods each Service routes to
kubectl get endpoints devops-app-blue
kubectl get endpoints devops-app-green
kubectl get endpoints devops-app-production

# Verify pod labels
kubectl get pods --show-labels

# Switch production traffic
kubectl patch service devops-app-production \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Instant rollback
kubectl patch service devops-app-production \
  -p '{"spec":{"selector":{"version":"blue"}}}'

# Wait for green rollout
kubectl rollout status deployment/devops-app-green
```

## Readiness Probe Example

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

## Official Docs

- [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Pod labels and selectors](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)
- [Readiness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
