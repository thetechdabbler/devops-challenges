# CD Challenges

Master continuous deployment — ship faster, safer, and with confidence using GitOps, progressive delivery, and automated rollbacks.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [gitops-with-argocd](./01-gitops-with-argocd/) | Beginner |
| 02 | [deploy-with-helm-cd](./02-deploy-with-helm-cd/) | Beginner |
| 03 | [blue-green-deployments](./03-blue-green-deployments/) | Intermediate |
| 04 | [canary-releases](./04-canary-releases/) | Intermediate |
| 05 | [deployment-notifications](./05-deployment-notifications/) | Intermediate |
| 06 | [rollback-strategies](./06-rollback-strategies/) | Intermediate |
| 07 | [multi-environment-promotion](./07-multi-environment-promotion/) | Advanced |
| 08 | [image-promotion-pipeline](./08-image-promotion-pipeline/) | Advanced |
| 09 | [database-migrations-in-cd](./09-database-migrations-in-cd/) | Advanced |
| 10 | [progressive-delivery-with-flagger](./10-progressive-delivery-with-flagger/) | Advanced |

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- Helm 3 installed
- ArgoCD or Flagger (exercise-specific)
- GitHub account

## Tools Covered

- ArgoCD (GitOps, sync policies, self-heal)
- Helm (upgrade, atomic, rollback)
- Argo Rollouts (canary, analysis templates)
- Flagger (progressive delivery, nginx ingress)
- kubectl rollout (history, undo, status)
- Trivy + cosign (image scanning, signing)
- Alembic (database migrations)
