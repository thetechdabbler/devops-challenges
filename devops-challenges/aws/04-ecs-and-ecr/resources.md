# Resources — ECS and ECR

## ECR Commands

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name devops-app

# Build and push
docker build -t devops-app .
docker tag devops-app:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/devops-app:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/devops-app:latest
```

## ECS Fargate Deployment

```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster devops-cluster \
  --service-name devops-app \
  --task-definition devops-app:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

## Official Docs

- [ECS task definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)
- [ECR user guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html)
- [Fargate task execution role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html)
