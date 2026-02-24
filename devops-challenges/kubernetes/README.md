# Kubernetes Challenges

Go from deploying your first Pod to debugging production outages and implementing RBAC.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [deploy-your-first-pod](./01-deploy-your-first-pod/) | Beginner |
| 02 | [deployments-and-replicas](./02-deployments-and-replicas/) | Beginner |
| 03 | [services-and-networking](./03-services-and-networking/) | Beginner |
| 04 | [configmaps-and-secrets](./04-configmaps-and-secrets/) | Intermediate |
| 05 | [persistent-storage](./05-persistent-storage/) | Intermediate |
| 06 | [resource-limits-and-requests](./06-resource-limits-and-requests/) | Intermediate |
| 07 | [liveness-and-readiness-probes](./07-liveness-and-readiness-probes/) | Intermediate |
| 08 | [rolling-updates-and-rollbacks](./08-rolling-updates-and-rollbacks/) | Intermediate |
| 09 | [ingress-and-tls](./09-ingress-and-tls/) | Advanced |
| 10 | [helm-basics](./10-helm-basics/) | Advanced |

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
