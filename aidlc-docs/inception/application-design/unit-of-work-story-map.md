# Unit of Work — Story Map

> Note: User Stories stage was skipped (content repository, no user personas).
> This map uses the exercise list as the equivalent of stories — each exercise is a learnable unit of value.

---

## Unit 1: repo-scaffolding

| Exercise / Task | Type | Priority |
|----------------|------|---------|
| Root README (overview, learning path, how to use) | Foundation | Must-have |
| .gitignore | Foundation | Must-have |
| shared-resources/app (Python Flask web server) | Foundation | Must-have |
| shared-resources/README.md | Foundation | Must-have |
| solutions/ directory | Foundation | Must-have |
| Per-topic README.md stubs (8 files) | Foundation | Must-have |

---

## Unit 2: docker

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-build-your-first-container | Beginner | Dockerfile, docker build/run |
| 02-multi-stage-builds | Beginner | Build size reduction, multi-stage |
| 03-docker-compose-basics | Beginner | Multi-container apps, compose file |
| 04-optimize-image-size | Intermediate | Layer caching, .dockerignore, slim images |
| 05-environment-variables-and-secrets | Intermediate | ENV, ARG, secrets handling |
| 06-health-checks-and-restart-policies | Intermediate | HEALTHCHECK, restart policies |
| 07-networking-between-containers | Intermediate | Bridge networks, DNS, service discovery |
| 08-production-hardening | Advanced | Non-root user, read-only FS, capabilities |
| 09-debugging-a-broken-container | Advanced | docker logs, exec, inspect, layer debugging |
| 10-multi-platform-builds | Advanced | buildx, ARM/AMD64, Docker Hub push |

---

## Unit 3: kubernetes

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-deploy-your-first-pod | Beginner | Pod spec, kubectl run/apply |
| 02-deployments-and-services | Beginner | Deployment, Service (ClusterIP/NodePort) |
| 03-configmaps-and-secrets | Beginner | ConfigMap, Secret, env injection |
| 04-resource-limits-and-requests | Intermediate | CPU/memory requests and limits |
| 05-liveness-and-readiness-probes | Intermediate | HTTP/exec probes, misconfigured probe debugging |
| 06-ingress-and-routing | Intermediate | Ingress controller, path routing |
| 07-helm-charts-basics | Intermediate | helm install, values.yaml, templating |
| 08-persistent-volumes | Advanced | PVC, StorageClass, stateful apps |
| 09-rbac-and-service-accounts | Advanced | Role, RoleBinding, ServiceAccount |
| 10-debug-a-broken-deployment | Advanced | CrashLoopBackOff, OOMKilled, ImagePullBackOff |

---

## Unit 4: ci

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-first-github-actions-workflow | Beginner | .github/workflows, triggers, jobs |
| 02-run-tests-in-ci | Beginner | Test runner in workflow, pass/fail |
| 03-build-and-push-docker-image | Beginner | docker/build-push-action, GHCR |
| 04-matrix-builds | Intermediate | matrix strategy, multiple OS/versions |
| 05-caching-dependencies | Intermediate | actions/cache, pip/npm caching |
| 06-secrets-and-environment-variables | Intermediate | GitHub Secrets, env context |
| 07-jenkins-pipeline-basics | Intermediate | Jenkinsfile, declarative pipeline |
| 08-fix-a-broken-pipeline | Advanced | Debugging failed workflows, error interpretation |
| 09-pipeline-optimization | Advanced | Parallel jobs, skip conditions, time reduction |
| 10-reusable-workflows | Advanced | workflow_call, composite actions |

---

## Unit 5: cd

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-deploy-on-push-to-main | Beginner | Trigger on push, SSH deploy |
| 02-environment-promotion | Beginner | Dev → Staging → Prod pattern |
| 03-manual-approval-gates | Intermediate | environments, required reviewers |
| 04-rollback-strategies | Intermediate | Revert deployment, previous image tag |
| 05-blue-green-deployment | Intermediate | Two environments, traffic switch |
| 06-canary-deployment | Intermediate | Incremental traffic shift |
| 07-argocd-setup-and-sync | Advanced | ArgoCD install, app sync |
| 08-gitops-with-argocd | Advanced | Git as source of truth, reconciliation |
| 09-deployment-notifications | Advanced | Slack/email notifications on deploy |
| 10-multi-environment-pipeline | Advanced | Full dev/staging/prod pipeline |

---

## Unit 6: ansible

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-first-playbook | Beginner | YAML playbook, hosts, tasks |
| 02-inventory-and-groups | Beginner | Inventory file, host groups |
| 03-variables-and-templates | Beginner | vars, Jinja2 templates |
| 04-handlers-and-notifications | Intermediate | notify, handler blocks |
| 05-roles-structure | Intermediate | roles/ layout, defaults, tasks |
| 06-ansible-vault-secrets | Intermediate | vault encrypt/decrypt, vault-id |
| 07-idempotency-patterns | Intermediate | Idempotent tasks, check mode |
| 08-ansible-galaxy-roles | Advanced | galaxy install, requirements.yml |
| 09-dynamic-inventory | Advanced | AWS/GCP dynamic inventory scripts |
| 10-debug-a-broken-playbook | Advanced | -vvv debugging, register, assert |

---

## Unit 7: iac

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-terraform-first-resource | Beginner | provider, resource, terraform init/apply |
| 02-variables-and-outputs | Beginner | variable, output, tfvars |
| 03-terraform-state | Beginner | terraform.tfstate, state file concepts |
| 04-terraform-modules | Intermediate | module block, reusable modules |
| 05-remote-state-backend | Intermediate | S3 backend, state locking with DynamoDB |
| 06-cloudformation-basics | Intermediate | YAML template, stack create/update |
| 07-cloudformation-stacks | Intermediate | Nested stacks, parameters, outputs |
| 08-detect-and-fix-drift | Advanced | terraform plan drift, cloudformation drift detection |
| 09-terraform-workspaces | Advanced | workspace per environment |
| 10-refactor-monolith-stack | Advanced | Split large stack, module extraction |

---

## Unit 8: observability

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-expose-prometheus-metrics | Beginner | /metrics endpoint, prometheus scrape config |
| 02-first-grafana-dashboard | Beginner | Grafana datasource, panels, PromQL basics |
| 03-alerting-rules | Beginner | PrometheusRule, Alertmanager basics |
| 04-structured-logging | Intermediate | JSON logs, log levels, correlation IDs |
| 05-opentelemetry-instrumentation | Intermediate | OTel SDK, traces, spans |
| 06-distributed-tracing-with-jaeger | Intermediate | Jaeger backend, trace visualization |
| 07-slo-and-error-budgets | Intermediate | SLI/SLO definition, burn rate alerts |
| 08-missing-monitoring | Advanced | Identify gaps, add metrics to an unmonitored app |
| 09-trace-a-slow-request | Advanced | Latency profiling, span analysis |
| 10-full-observability-stack | Advanced | Logs + metrics + traces end-to-end |

---

## Unit 9: aws

| Exercise | Level | Key Skill |
|---------|-------|-----------|
| 01-iam-users-and-policies | Beginner | IAM user, policy, least-privilege |
| 02-launch-an-ec2-instance | Beginner | EC2, key pair, security group, SSH |
| 03-s3-bucket-and-policies | Beginner | S3 create, bucket policy, ACL |
| 04-vpc-and-subnets | Intermediate | VPC, public/private subnets, route tables |
| 05-security-groups-and-nacls | Intermediate | Inbound/outbound rules, stateless vs stateful |
| 06-deploy-to-ecs-fargate | Intermediate | ECS task definition, Fargate service |
| 07-rds-setup-and-access | Intermediate | RDS instance, security group, connection |
| 08-lambda-and-api-gateway | Advanced | Lambda function, API Gateway trigger |
| 09-cross-account-iam-roles | Advanced | AssumeRole, trust policies |
| 10-cost-optimization-audit | Advanced | Cost Explorer, right-sizing, unused resources |
