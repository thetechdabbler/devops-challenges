# Challenge — ECS and ECR

## Scenario

Your team deploys a containerized app to ECS Fargate using an image from ECR. A colleague wrote the ECS task definition and service configuration but got the container port mapping wrong, used the wrong launch type, forgot the task role ARN format, and broke the image URI format.

Fix the task definition and service so the container launches successfully.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Image URI uses wrong account format** — `123456789.dkr.ecr.us-east-1.amazonaws.com/app:latest` is missing a digit — AWS account IDs are 12 digits: `123456789012.dkr.ecr...`
2. **`networkMode` wrong for Fargate** — `networkMode: bridge` is not supported on Fargate; use `awsvpc`
3. **`containerPort` wrong** — `containerPort: 8080` but the service expects port `80`
4. **`requiresCompatibilities` wrong** — `["EC2"]` should be `["FARGATE"]`
5. **`executionRoleArn` missing** — Fargate requires an `executionRoleArn` (task execution role) to pull from ECR and write logs; it's missing from the task definition

## Acceptance Criteria

- [ ] Image URI uses 12-digit AWS account ID
- [ ] `networkMode: awsvpc`
- [ ] Container port is `80`
- [ ] `requiresCompatibilities: ["FARGATE"]`
- [ ] `executionRoleArn` is set

## Learning Notes

**ECS Task Definition (Fargate):**
```json
{
  "family": "devops-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [{
    "name": "app",
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/devops-app:latest",
    "portMappings": [{"containerPort": 80}],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/devops-app",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
```
