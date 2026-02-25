# Exercise 04 — ECS and ECR

Fix an ECS Fargate task definition and service configuration to deploy a containerized app from ECR.

## Quick Start

```bash
# Push image to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t devops-app . && docker push <account>.dkr.ecr.us-east-1.amazonaws.com/devops-app:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://starter/task-definition.json
```

## Files

```
starter/
  task-definition.json  — ECS task definition (5 bugs)
solutions/
  task-definition.json  — fixed task definition
  step-by-step-solution.md
```
