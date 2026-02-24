# Infrastructure as Code Challenges

Provision and manage infrastructure with Terraform and AWS CloudFormation.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [terraform-first-resource](./01-terraform-first-resource/) | Beginner |
| 02 | [variables-and-outputs](./02-variables-and-outputs/) | Beginner |
| 03 | [terraform-state](./03-terraform-state/) | Beginner |
| 04 | [terraform-modules](./04-terraform-modules/) | Intermediate |
| 05 | [remote-state-backend](./05-remote-state-backend/) | Intermediate |
| 06 | [cloudformation-basics](./06-cloudformation-basics/) | Intermediate |
| 07 | [cloudformation-stacks](./07-cloudformation-stacks/) | Intermediate |
| 08 | [detect-and-fix-drift](./08-detect-and-fix-drift/) | Advanced |
| 09 | [terraform-workspaces](./09-terraform-workspaces/) | Advanced |
| 10 | [refactor-monolith-stack](./10-refactor-monolith-stack/) | Advanced |

## Prerequisites

- AWS account (free tier sufficient for most exercises)
- AWS CLI configured (`aws configure`)
- Terraform installed (`brew install terraform` or [tfenv](https://github.com/tfutils/tfenv))

## Tools Covered

- Terraform (init, plan, apply, destroy, state, workspace)
- Terraform modules and remote state (S3 + DynamoDB)
- AWS CloudFormation (stacks, nested stacks, parameters, outputs)
- Drift detection

> **Cost note**: Most exercises use free-tier resources. Each challenge notes any resources that may incur charges and how to clean them up.
