# Step-by-Step Solution — ECS and ECR

## Bug 1 — Image URI missing digits in account ID

AWS account IDs are always 12 digits. `123456789` is only 9 digits.

```json
// Wrong
"123456789.dkr.ecr.us-east-1.amazonaws.com/devops-app:latest"

// Fixed
"123456789012.dkr.ecr.us-east-1.amazonaws.com/devops-app:latest"
```

## Bug 2 — `networkMode: bridge` not supported on Fargate

Fargate only supports `awsvpc` network mode. `bridge` is an EC2 launch type network mode.

```json
"networkMode": "awsvpc"
```

## Bug 3 — Container port 8080 instead of 80

The task definition must declare the port the container actually listens on. If the app listens on 80, the `containerPort` must be 80.

```json
"containerPort": 80
```

## Bug 4 — `requiresCompatibilities: ["EC2"]` should be `["FARGATE"]`

This tells ECS the task is designed for Fargate launch type. Setting it to `EC2` means the Fargate scheduler rejects it.

```json
"requiresCompatibilities": ["FARGATE"]
```

## Bug 5 — Missing `executionRoleArn`

The task execution role allows Fargate to pull the Docker image from ECR and send logs to CloudWatch. Without it, the task fails to start with a permissions error.

```json
"executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole"
```

## Verify

```bash
aws ecs register-task-definition --cli-input-json file://solutions/task-definition.json
aws ecs describe-task-definition --task-definition devops-app
```
