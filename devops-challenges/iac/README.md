# Infrastructure as Code Challenges

Provision and manage infrastructure with Terraform — from basics to testing.

## Learning Path

| # | Exercise | Level |
|---|---------|-------|
| 01 | [terraform-basics](./01-terraform-basics/) | Beginner |
| 02 | [variables-and-outputs](./02-variables-and-outputs/) | Beginner |
| 03 | [resource-dependencies](./03-resource-dependencies/) | Beginner |
| 04 | [remote-state](./04-remote-state/) | Intermediate |
| 05 | [modules](./05-modules/) | Intermediate |
| 06 | [workspaces-and-environments](./06-workspaces-and-environments/) | Intermediate |
| 07 | [data-sources](./07-data-sources/) | Intermediate |
| 08 | [provisioners-and-null-resources](./08-provisioners-and-null-resources/) | Advanced |
| 09 | [terraform-cloud](./09-terraform-cloud/) | Advanced |
| 10 | [terratest-and-testing](./10-terratest-and-testing/) | Advanced |

## Prerequisites

- AWS account (free tier sufficient for most exercises)
- AWS CLI configured (`aws configure`)
- Terraform installed (`brew install terraform` or [tfenv](https://github.com/tfutils/tfenv))
- Go 1.21+ (exercise 10 only)

## Tools Covered

- Terraform (init, plan, apply, destroy, validate)
- Variables, outputs, locals, and type constraints
- Resource dependencies and implicit/explicit ordering
- Remote state (S3 + DynamoDB locking)
- Modules — local and registry
- Workspaces for multi-environment deployments
- Data sources for referencing existing infrastructure
- Provisioners and null resources
- Terraform Cloud remote execution
- Terratest for infrastructure testing

> **Cost note**: Most exercises use free-tier resources. Always run `terraform destroy` after completing an exercise.
