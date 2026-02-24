# Requirements Document
## DevOps Challenge Repository (DevOpsTeacher)

---

## Intent Analysis

| Field | Value |
|-------|-------|
| **User Request** | Build a public GitHub repository of hands-on DevOps challenges and exercises that simulate ~2 years of practical experience |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | System-wide — multiple topic directories, 8–10 exercises each, solutions, shared resources, git workflow |
| **Complexity Estimate** | Moderate-to-Complex — content-heavy, multi-topic, structured progression, CI/CD integration |

---

## Functional Requirements

### FR-1: Repository Structure

The repository (`devops-challenges/`) must be organized into topic directories at the root level:

```
devops-challenges/
├── docker/
├── kubernetes/
├── ci/
├── cd/
├── ansible/
├── iac/
├── observability/
├── aws/
├── solutions/
└── shared-resources/
```

### FR-2: Exercise Count and Progression

- **8–10 exercises per topic** in the initial version
- Exercises within each topic must progress from **Beginner → Intermediate → Advanced**
- Each topic must be numbered sequentially (e.g., `01-build-container/`, `02-multi-stage-builds/`)

### FR-3: Exercise Structure

Every exercise directory must contain:

| File | Purpose |
|------|---------|
| `challenge.md` | Challenge statement, goal, prerequisites, tasks, acceptance criteria, learning notes |
| `README.md` | Quick-start guide for the exercise |
| `resources.md` | Curated links and short explanations of core concepts |

**Starter files** (mandatory for all exercises):
- Broken configs, failing pipelines, incomplete scripts, or partial manifests
- Learner must fix/complete them as part of the challenge

### FR-4: Challenge Template

Each `challenge.md` must use this exact template:

```
## Challenge Statement
Realistic production problem description.

## Goal
What success looks like (clear, measurable).

## Prerequisites
Tools and knowledge required before starting.

## Tasks
Numbered steps the learner must perform.

## Acceptance Criteria
Measurable pass/fail conditions.

## Learning Notes
Short explanation of core concepts used in the exercise.

## Resources
Links to official docs and references.
```

### FR-5: Solutions Directory

Each exercise must have a matching solution at `solutions/<topic>/<exercise-name>/` containing:
- `step-by-step-solution.md` — full walkthrough with reasoning
- Working configs, scripts, manifests
- Explanation of WHY each decision was made
- Production tips and gotchas

### FR-6: Shared Resources

A `shared-resources/` directory must include a **simple sample application** (small web server) used consistently across all topics, so learners work with the same app when containerizing, deploying to Kubernetes, setting up pipelines, monitoring, etc.

### FR-7: Topic Coverage and Tools

| Topic | Primary Tools |
|-------|--------------|
| `docker/` | Docker, Docker Compose, Docker Hub |
| `kubernetes/` | kubectl, Helm, Docker Desktop (K8s enabled) |
| `ci/` | GitHub Actions, Jenkins |
| `cd/` | GitHub Actions, Jenkins, ArgoCD (GitOps pattern) |
| `ansible/` | Ansible, Ansible Vault, Ansible Galaxy |
| `iac/` | Terraform, AWS CloudFormation |
| `observability/` | OpenTelemetry, Jaeger, Prometheus, Grafana |
| `aws/` | AWS CLI, IAM, EC2, ECS, S3, RDS, VPC, Lambda |

### FR-8: Real-World Scenarios

Exercises must simulate real production issues, such as:
- Slow or broken CI pipelines
- Failing Kubernetes health probes
- Misconfigured Dockerfiles causing bloated images
- Missing monitoring and alerting
- Exposed secrets in configs
- Deployment failures due to misconfigured manifests
- IaC drift or state conflicts

Toy examples are explicitly excluded.

### FR-9: Git Workflow

After each exercise is created, the workflow must be:

1. Create a feature branch (`feat/<topic>/<exercise-name>`)
2. Add challenge files
3. Add documentation
4. Add solution
5. Commit with a conventional commit message
6. Open a Pull Request on GitHub
7. Merge after review

### FR-10: Scripting Language Conventions

| Use Case | Language |
|----------|---------|
| Infrastructure tasks (setup scripts, teardown, config) | Bash |
| Automation scripts (data processing, API calls, orchestration) | Python |

---

## Non-Functional Requirements

### NFR-1: Learner Baseline
- **Assumed knowledge**: Linux terminal, basic scripting (Bash), Git fundamentals
- **Not assumed**: Any DevOps tooling, CI/CD, Kubernetes, Docker, cloud experience
- Exercises must provide enough context in `Learning Notes` and `Resources` for a junior developer to succeed

### NFR-2: Exercise Runnability
- Every exercise must be runnable on a standard developer laptop (macOS/Linux/Windows WSL2)
- Kubernetes exercises target **Docker Desktop with Kubernetes enabled**
- AWS exercises must note any costs and provide free-tier alternatives where possible

### NFR-3: Content Quality
- All challenges must describe realistic production scenarios (no toy examples)
- Solutions must explain decisions, not just show commands
- Learning notes and resources must be curated and accurate

### NFR-4: Repository Usability
- Each topic directory must have its own `README.md` explaining the learning path
- A root-level `README.md` must provide an overview of the entire repository, learning path, and how to use it
- Exercises must be discoverable and navigable without external tooling

### NFR-5: Maintainability
- Consistent file structure across all topics and exercises
- Conventional commit messages for all changes
- PRs opened per exercise to enable review and contribution workflow

### NFR-6: License
- Public domain — no license file (open for anyone to use freely)

---

## Out of Scope (Initial Version)

- Automated grading or test runners for exercise acceptance criteria
- A web frontend or portal
- CI/CD pipeline for the repository itself
- Community contribution guidelines (can be added later)
- Cost estimation tooling for AWS exercises
