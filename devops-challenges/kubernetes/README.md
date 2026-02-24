# Kubernetes Challenges

Go from deploying your first Pod to debugging production outages and implementing RBAC.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [deploy-your-first-pod](./01-deploy-your-first-pod/) | Beginner |
| 02 | [deployments-and-services](./02-deployments-and-services/) | Beginner |
| 03 | [configmaps-and-secrets](./03-configmaps-and-secrets/) | Beginner |
| 04 | [resource-limits-and-requests](./04-resource-limits-and-requests/) | Intermediate |
| 05 | [liveness-and-readiness-probes](./05-liveness-and-readiness-probes/) | Intermediate |
| 06 | [ingress-and-routing](./06-ingress-and-routing/) | Intermediate |
| 07 | [helm-charts-basics](./07-helm-charts-basics/) | Intermediate |
| 08 | [persistent-volumes](./08-persistent-volumes/) | Advanced |
| 09 | [rbac-and-service-accounts](./09-rbac-and-service-accounts/) | Advanced |
| 10 | [debug-a-broken-deployment](./10-debug-a-broken-deployment/) | Advanced |

## Prerequisites

- Docker Desktop with Kubernetes enabled (Settings → Kubernetes → Enable)
- `kubectl` installed
- `helm` installed
- Docker exercises completed (sample app should be containerized)

## Tools Covered

- `kubectl` (apply, get, describe, logs, exec, port-forward)
- Kubernetes manifests (Pod, Deployment, Service, Ingress, ConfigMap, Secret, PVC)
- Helm
- RBAC resources (Role, RoleBinding, ServiceAccount)
