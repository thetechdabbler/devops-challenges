# DevOps Challenges

A hands-on challenge repository designed to give you the equivalent of **two years of practical DevOps experience** through real-world exercises.

Every challenge simulates a problem you would actually face on the job — broken pipelines, misconfigured deployments, missing monitoring, exposed secrets. No toy examples.

---

## Who This Is For

Engineers who know basic scripting and Git and want to break into DevOps or level up fast. Each topic starts from zero and progresses to the kind of work expected from a mid-level DevOps engineer.

---

## Topics

| Topic | What You'll Learn |
|-------|------------------|
| [Docker](./docker/README.md) | Containers, multi-stage builds, Compose, image optimization, production hardening |
| [Kubernetes](./kubernetes/README.md) | Pods, Deployments, Services, Ingress, Helm, RBAC, troubleshooting |
| [CI](./ci/README.md) | GitHub Actions, Jenkins, matrix builds, caching, secrets, broken pipeline debugging |
| [CD](./cd/README.md) | Deployment pipelines, environment promotion, blue-green, canary, ArgoCD GitOps |
| [Ansible](./ansible/README.md) | Playbooks, roles, Vault, Galaxy, idempotency, dynamic inventory |
| [IaC](./iac/README.md) | Terraform modules, state, workspaces, CloudFormation stacks, drift detection |
| [Observability](./observability/README.md) | Prometheus, Grafana, OpenTelemetry, Jaeger, alerting, SLOs |
| [AWS](./aws/README.md) | IAM, EC2, VPC, S3, ECS Fargate, RDS, Lambda, cost optimization |

---

## How to Use This Repo

### 1. Pick a topic
Start with **Docker** if you have no DevOps background. The topics build on each other in this recommended order:

```
Docker → Kubernetes → CI → CD → Ansible → IaC → Observability → AWS
```

### 2. Open a challenge
Each topic directory contains numbered exercises. Start at `01` and work forward. Each exercise folder contains:

| File | Purpose |
|------|---------|
| `README.md` | Quick start — what the exercise is about |
| `challenge.md` | The full challenge: statement, goal, tasks, acceptance criteria, learning notes |
| `resources.md` | Curated links and short concept explanations |
| `starter/` | Broken configs, failing pipelines, or incomplete scripts to fix |

### 3. Work the challenge
Read `challenge.md`. Use the starter files as your starting point. Complete all tasks. Verify against the acceptance criteria.

### 4. Check the solution
Solutions live in `solutions/<topic>/<exercise-name>/`. Each solution explains **why** things work, not just what commands to run.

### 5. Use the sample app
All exercises use the same small web app from `shared-resources/app/`. Containerize it, deploy it to Kubernetes, build pipelines around it, monitor it. One app, all the skills.

---

## Prerequisites

- Linux or macOS terminal (or Windows with WSL2)
- Git installed and configured
- Docker Desktop installed (Kubernetes enabled for K8s exercises)
- Python 3.x for running the sample app locally
- An AWS account for AWS exercises (free tier is sufficient for most)

---

## Difficulty Levels

| Level | What to expect |
|-------|---------------|
| **Beginner** | Step-by-step guidance, foundational concepts |
| **Intermediate** | Some prior knowledge assumed, real-world patterns |
| **Advanced** | Debugging, production thinking, minimal hand-holding |

---

## Repository Structure

```
devops-challenges/
├── README.md                   # This file
├── shared-resources/
│   ├── README.md
│   └── app/                    # Sample web app used across all topics
├── solutions/                  # Step-by-step solutions for every exercise
│   ├── docker/
│   ├── kubernetes/
│   ├── ci/
│   ├── cd/
│   ├── ansible/
│   ├── iac/
│   ├── observability/
│   └── aws/
├── docker/
│   ├── README.md
│   ├── 01-build-your-first-container/
│   └── ...
├── kubernetes/
├── ci/
├── cd/
├── ansible/
├── iac/
├── observability/
└── aws/
```

---

## Contributing

Found an issue or want to add an exercise? Open a PR. Follow the existing challenge template and make sure your exercise is runnable.
