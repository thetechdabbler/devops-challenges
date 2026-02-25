# AWS Challenges

Learn the core AWS services used daily by DevOps and platform engineers.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [ec2-and-security-groups](./01-ec2-and-security-groups/) | Beginner |
| 02 | [s3-and-iam](./02-s3-and-iam/) | Beginner |
| 03 | [rds-and-secrets](./03-rds-and-secrets/) | Beginner |
| 04 | [ecs-and-ecr](./04-ecs-and-ecr/) | Intermediate |
| 05 | [lambda-and-api-gateway](./05-lambda-and-api-gateway/) | Intermediate |
| 06 | [cloudwatch-alarms](./06-cloudwatch-alarms/) | Intermediate |
| 07 | [elb-and-auto-scaling](./07-elb-and-auto-scaling/) | Intermediate |
| 08 | [vpc-networking](./08-vpc-networking/) | Advanced |
| 09 | [codepipeline-cicd](./09-codepipeline-cicd/) | Advanced |
| 10 | [eks-cluster-setup](./10-eks-cluster-setup/) | Advanced |

## Prerequisites

- AWS account (free tier is sufficient for most exercises)
- AWS CLI installed and configured (`aws configure`)
- Basic understanding of networking concepts (IP, ports, DNS)

## Tools Covered

- AWS CLI
- EC2 (instances, security groups, user data, key pairs)
- S3 (buckets, policies, versioning) + IAM (roles, policies, least-privilege)
- RDS (managed databases) + Secrets Manager
- ECS Fargate (task definitions, services, clusters) + ECR
- Lambda + API Gateway
- CloudWatch (alarms, metrics, logs, dashboards)
- ELB (Application Load Balancer) + Auto Scaling Groups
- VPC (subnets, route tables, NAT gateway, VPC endpoints)
- CodePipeline + CodeBuild + CodeDeploy
- EKS (managed Kubernetes cluster setup)

> **Cost note**: Most exercises stay within the AWS free tier. Always run cleanup commands after completing each exercise.
