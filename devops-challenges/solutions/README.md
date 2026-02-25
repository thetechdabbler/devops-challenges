# Solutions

This directory contains step-by-step solutions for every exercise in the repo.

## How to Use Solutions

1. **Attempt the challenge first.** Solutions are most valuable after you've struggled with the problem yourself.
2. **Read the reasoning.** Each `step-by-step-solution.md` explains *why* each decision was made, not just the commands to run.
3. **Compare your approach.** Your solution may differ from the one here — that's fine. Use it as a reference, not the only way.

## What Each Solution Contains

| File | Purpose |
|------|---------|
| `step-by-step-solution.md` | Full walkthrough with explanations and production tips |
| Working config files | The completed version of any starter files from the challenge |

## Exercise Index

### Docker
| # | Exercise |
|---|----------|
| 01 | [build-your-first-container](docker/01-build-your-first-container/) |
| 02 | [multi-stage-builds](docker/02-multi-stage-builds/) |
| 03 | [docker-compose-basics](docker/03-docker-compose-basics/) |
| 04 | [optimize-image-size](docker/04-optimize-image-size/) |
| 05 | [environment-variables-and-secrets](docker/05-environment-variables-and-secrets/) |
| 06 | [health-checks-and-restart-policies](docker/06-health-checks-and-restart-policies/) |
| 07 | [networking-between-containers](docker/07-networking-between-containers/) |
| 08 | [production-hardening](docker/08-production-hardening/) |
| 09 | [debugging-a-broken-container](docker/09-debugging-a-broken-container/) |
| 10 | [multi-platform-builds](docker/10-multi-platform-builds/) |

### Kubernetes
| # | Exercise |
|---|----------|
| 01 | [deploy-your-first-pod](kubernetes/01-deploy-your-first-pod/) |
| 02 | [deployments-and-replicas](kubernetes/02-deployments-and-replicas/) |
| 03 | [services-and-networking](kubernetes/03-services-and-networking/) |
| 04 | [configmaps-and-secrets](kubernetes/04-configmaps-and-secrets/) |
| 05 | [persistent-storage](kubernetes/05-persistent-storage/) |
| 06 | [resource-limits-and-requests](kubernetes/06-resource-limits-and-requests/) |
| 07 | [liveness-and-readiness-probes](kubernetes/07-liveness-and-readiness-probes/) |
| 08 | [rolling-updates-and-rollbacks](kubernetes/08-rolling-updates-and-rollbacks/) |
| 09 | [ingress-and-tls](kubernetes/09-ingress-and-tls/) |
| 10 | [helm-basics](kubernetes/10-helm-basics/) |

### CI
| # | Exercise |
|---|----------|
| 01 | [your-first-github-actions-workflow](ci/01-your-first-github-actions-workflow/) |
| 02 | [test-and-lint-on-push](ci/02-test-and-lint-on-push/) |
| 03 | [build-and-push-docker-image](ci/03-build-and-push-docker-image/) |
| 04 | [environment-variables-and-secrets](ci/04-environment-variables-and-secrets/) |
| 05 | [matrix-builds](ci/05-matrix-builds/) |
| 06 | [caching-dependencies](ci/06-caching-dependencies/) |
| 07 | [reusable-workflows](ci/07-reusable-workflows/) |
| 08 | [manual-approvals-and-environments](ci/08-manual-approvals-and-environments/) |
| 09 | [jenkins-pipeline-basics](ci/09-jenkins-pipeline-basics/) |
| 10 | [ci-for-pull-requests](ci/10-ci-for-pull-requests/) |

### CD
| # | Exercise |
|---|----------|
| 01 | [gitops-with-argocd](cd/01-gitops-with-argocd/) |
| 02 | [deploy-with-helm-cd](cd/02-deploy-with-helm-cd/) |
| 03 | [blue-green-deployments](cd/03-blue-green-deployments/) |
| 04 | [canary-releases](cd/04-canary-releases/) |
| 05 | [deployment-notifications](cd/05-deployment-notifications/) |
| 06 | [rollback-strategies](cd/06-rollback-strategies/) |
| 07 | [multi-environment-promotion](cd/07-multi-environment-promotion/) |
| 08 | [image-promotion-pipeline](cd/08-image-promotion-pipeline/) |
| 09 | [database-migrations-in-cd](cd/09-database-migrations-in-cd/) |
| 10 | [progressive-delivery-with-flagger](cd/10-progressive-delivery-with-flagger/) |

### Ansible
| # | Exercise |
|---|----------|
| 01 | [your-first-playbook](ansible/01-your-first-playbook/) |
| 02 | [variables-and-templates](ansible/02-variables-and-templates/) |
| 03 | [roles-and-reusability](ansible/03-roles-and-reusability/) |
| 04 | [handlers-and-notifications](ansible/04-handlers-and-notifications/) |
| 05 | [ansible-vault](ansible/05-ansible-vault/) |
| 06 | [inventory-and-groups](ansible/06-inventory-and-groups/) |
| 07 | [conditionals-and-loops](ansible/07-conditionals-and-loops/) |
| 08 | [ansible-galaxy](ansible/08-ansible-galaxy/) |
| 09 | [dynamic-inventory](ansible/09-dynamic-inventory/) |
| 10 | [ci-with-ansible](ansible/10-ci-with-ansible/) |

### IaC (Terraform)
| # | Exercise |
|---|----------|
| 01 | [terraform-basics](iac/01-terraform-basics/) |
| 02 | [variables-and-outputs](iac/02-variables-and-outputs/) |
| 03 | [resource-dependencies](iac/03-resource-dependencies/) |
| 04 | [remote-state](iac/04-remote-state/) |
| 05 | [modules](iac/05-modules/) |
| 06 | [workspaces-and-environments](iac/06-workspaces-and-environments/) |
| 07 | [data-sources](iac/07-data-sources/) |
| 08 | [provisioners-and-null-resources](iac/08-provisioners-and-null-resources/) |
| 09 | [terraform-cloud](iac/09-terraform-cloud/) |
| 10 | [terratest-and-testing](iac/10-terratest-and-testing/) |

### Observability
| # | Exercise |
|---|----------|
| 01 | [prometheus-basics](observability/01-prometheus-basics/) |
| 02 | [grafana-dashboards](observability/02-grafana-dashboards/) |
| 03 | [alertmanager](observability/03-alertmanager/) |
| 04 | [logging-with-loki](observability/04-logging-with-loki/) |
| 05 | [distributed-tracing-with-jaeger](observability/05-distributed-tracing-with-jaeger/) |
| 06 | [opentelemetry-instrumentation](observability/06-opentelemetry-instrumentation/) |
| 07 | [kubernetes-monitoring](observability/07-kubernetes-monitoring/) |
| 08 | [log-aggregation-with-elk](observability/08-log-aggregation-with-elk/) |
| 09 | [synthetic-monitoring](observability/09-synthetic-monitoring/) |
| 10 | [slos-and-error-budgets](observability/10-slos-and-error-budgets/) |

### AWS
| # | Exercise |
|---|----------|
| 01 | [ec2-and-security-groups](aws/01-ec2-and-security-groups/) |
| 02 | [s3-and-iam](aws/02-s3-and-iam/) |
| 03 | [rds-and-secrets](aws/03-rds-and-secrets/) |
| 04 | [ecs-and-ecr](aws/04-ecs-and-ecr/) |
| 05 | [lambda-and-api-gateway](aws/05-lambda-and-api-gateway/) |
| 06 | [cloudwatch-alarms](aws/06-cloudwatch-alarms/) |
| 07 | [elb-and-auto-scaling](aws/07-elb-and-auto-scaling/) |
| 08 | [vpc-networking](aws/08-vpc-networking/) |
| 09 | [codepipeline-cicd](aws/09-codepipeline-cicd/) |
| 10 | [eks-cluster-setup](aws/10-eks-cluster-setup/) |

> **Don't peek too early.** The struggle is where the learning happens.
