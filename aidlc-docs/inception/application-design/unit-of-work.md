# Units of Work
## DevOps Challenge Repository

---

## Unit 1: repo-scaffolding

**Type**: Foundation unit (must complete before all others)

**Responsibilities**:
- Initialize repository root structure (`devops-challenges/` layout)
- Create root `README.md` (overview, learning path, how to use the repo)
- Create root `.gitignore`
- Create `shared-resources/` directory with sample application (small HTTP web server used across all topic exercises)
- Create topic-level `README.md` files for each of the 8 topic directories (placeholder structure, filled by each topic unit)
- Create `solutions/` top-level directory

**Deliverables**:
```
devops-challenges/
├── README.md
├── .gitignore
├── shared-resources/
│   ├── README.md
│   └── app/                  # Simple web server (Python Flask or Node.js)
│       ├── app.py / index.js
│       ├── requirements.txt / package.json
│       └── README.md
├── solutions/
├── docker/README.md
├── kubernetes/README.md
├── ci/README.md
├── cd/README.md
├── ansible/README.md
├── iac/README.md
├── observability/README.md
└── aws/README.md
```

**Code organization**: Greenfield — create from scratch at workspace root.

---

## Unit 2: docker

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering Docker fundamentals through production hardening
- Each exercise: `challenge.md`, `README.md`, `resources.md`, starter files
- Each exercise: matching solution in `solutions/docker/<exercise-name>/`
- Git commit + PR per exercise

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | build-your-first-container | Beginner |
| 02 | multi-stage-builds | Beginner |
| 03 | docker-compose-basics | Beginner |
| 04 | optimize-image-size | Intermediate |
| 05 | environment-variables-and-secrets | Intermediate |
| 06 | health-checks-and-restart-policies | Intermediate |
| 07 | networking-between-containers | Intermediate |
| 08 | production-hardening | Advanced |
| 09 | debugging-a-broken-container | Advanced |
| 10 | multi-platform-builds | Advanced |

---

## Unit 3: kubernetes

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering Kubernetes from first deployment to advanced troubleshooting
- Uses shared-resources sample app for deployments
- Targets Docker Desktop with Kubernetes enabled

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | deploy-your-first-pod | Beginner |
| 02 | deployments-and-services | Beginner |
| 03 | configmaps-and-secrets | Beginner |
| 04 | resource-limits-and-requests | Intermediate |
| 05 | liveness-and-readiness-probes | Intermediate |
| 06 | ingress-and-routing | Intermediate |
| 07 | helm-charts-basics | Intermediate |
| 08 | persistent-volumes | Advanced |
| 09 | rbac-and-service-accounts | Advanced |
| 10 | debug-a-broken-deployment | Advanced |

---

## Unit 4: ci

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering CI pipelines with GitHub Actions and Jenkins
- Includes broken pipeline starter files for debugging exercises

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | first-github-actions-workflow | Beginner |
| 02 | run-tests-in-ci | Beginner |
| 03 | build-and-push-docker-image | Beginner |
| 04 | matrix-builds | Intermediate |
| 05 | caching-dependencies | Intermediate |
| 06 | secrets-and-environment-variables | Intermediate |
| 07 | jenkins-pipeline-basics | Intermediate |
| 08 | fix-a-broken-pipeline | Advanced |
| 09 | pipeline-optimization | Advanced |
| 10 | reusable-workflows | Advanced |

---

## Unit 5: cd

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering CD pipelines, environment promotion, ArgoCD GitOps, and rollback

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | deploy-on-push-to-main | Beginner |
| 02 | environment-promotion | Beginner |
| 03 | manual-approval-gates | Intermediate |
| 04 | rollback-strategies | Intermediate |
| 05 | blue-green-deployment | Intermediate |
| 06 | canary-deployment | Intermediate |
| 07 | argocd-setup-and-sync | Advanced |
| 08 | gitops-with-argocd | Advanced |
| 09 | deployment-notifications | Advanced |
| 10 | multi-environment-pipeline | Advanced |

---

## Unit 6: ansible

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering Ansible from playbook basics to Galaxy roles

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | first-playbook | Beginner |
| 02 | inventory-and-groups | Beginner |
| 03 | variables-and-templates | Beginner |
| 04 | handlers-and-notifications | Intermediate |
| 05 | roles-structure | Intermediate |
| 06 | ansible-vault-secrets | Intermediate |
| 07 | idempotency-patterns | Intermediate |
| 08 | ansible-galaxy-roles | Advanced |
| 09 | dynamic-inventory | Advanced |
| 10 | debug-a-broken-playbook | Advanced |

---

## Unit 7: iac

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering Terraform and AWS CloudFormation

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | terraform-first-resource | Beginner |
| 02 | variables-and-outputs | Beginner |
| 03 | terraform-state | Beginner |
| 04 | terraform-modules | Intermediate |
| 05 | remote-state-backend | Intermediate |
| 06 | cloudformation-basics | Intermediate |
| 07 | cloudformation-stacks | Intermediate |
| 08 | detect-and-fix-drift | Advanced |
| 09 | terraform-workspaces | Advanced |
| 10 | refactor-monolith-stack | Advanced |

---

## Unit 8: observability

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering OpenTelemetry, Jaeger, Prometheus, and Grafana

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | expose-prometheus-metrics | Beginner |
| 02 | first-grafana-dashboard | Beginner |
| 03 | alerting-rules | Beginner |
| 04 | structured-logging | Intermediate |
| 05 | opentelemetry-instrumentation | Intermediate |
| 06 | distributed-tracing-with-jaeger | Intermediate |
| 07 | slo-and-error-budgets | Intermediate |
| 08 | missing-monitoring | Advanced |
| 09 | trace-a-slow-request | Advanced |
| 10 | full-observability-stack | Advanced |

---

## Unit 9: aws

**Type**: Topic unit

**Responsibilities**:
- Generate 8–10 exercises covering core AWS services (IAM, EC2, VPC, S3, ECS, RDS, Lambda)
- Includes cost-awareness notes and free-tier alternatives

**Exercise progression**:
| # | Name | Level |
|---|------|-------|
| 01 | iam-users-and-policies | Beginner |
| 02 | launch-an-ec2-instance | Beginner |
| 03 | s3-bucket-and-policies | Beginner |
| 04 | vpc-and-subnets | Intermediate |
| 05 | security-groups-and-nacls | Intermediate |
| 06 | deploy-to-ecs-fargate | Intermediate |
| 07 | rds-setup-and-access | Intermediate |
| 08 | lambda-and-api-gateway | Advanced |
| 09 | cross-account-iam-roles | Advanced |
| 10 | cost-optimization-audit | Advanced |
