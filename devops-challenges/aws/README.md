# AWS Challenges

Learn the core AWS services used daily by DevOps and platform engineers.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [iam-users-and-policies](./01-iam-users-and-policies/) | Beginner |
| 02 | [launch-an-ec2-instance](./02-launch-an-ec2-instance/) | Beginner |
| 03 | [s3-bucket-and-policies](./03-s3-bucket-and-policies/) | Beginner |
| 04 | [vpc-and-subnets](./04-vpc-and-subnets/) | Intermediate |
| 05 | [security-groups-and-nacls](./05-security-groups-and-nacls/) | Intermediate |
| 06 | [deploy-to-ecs-fargate](./06-deploy-to-ecs-fargate/) | Intermediate |
| 07 | [rds-setup-and-access](./07-rds-setup-and-access/) | Intermediate |
| 08 | [lambda-and-api-gateway](./08-lambda-and-api-gateway/) | Advanced |
| 09 | [cross-account-iam-roles](./09-cross-account-iam-roles/) | Advanced |
| 10 | [cost-optimization-audit](./10-cost-optimization-audit/) | Advanced |

## Prerequisites

- AWS account (free tier is sufficient for most exercises)
- AWS CLI installed and configured (`aws configure`)
- Basic understanding of networking concepts (IP, ports, DNS)

## Tools Covered

- AWS CLI
- IAM (users, roles, policies, least-privilege)
- EC2 (instances, key pairs, security groups, user data)
- VPC (subnets, route tables, internet gateway, NAT gateway)
- S3 (buckets, policies, versioning)
- ECS Fargate (task definitions, services, clusters)
- RDS (instances, parameter groups, snapshots)
- Lambda + API Gateway
- Cost Explorer and Trusted Advisor

> **Cost note**: Most exercises stay within the AWS free tier. Each challenge clearly notes resources that may incur charges and includes a cleanup section.
