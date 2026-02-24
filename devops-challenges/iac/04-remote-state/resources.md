# Resources — Remote State

## S3 Backend Reference

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "global/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"

    # Optional: IAM role for CI
    role_arn = "arn:aws:iam::123456789:role/TerraformCI"
  }
}
```

## State Commands

```bash
# Migrate state to new backend
terraform init -reconfigure

# List resources in state
terraform state list

# Show a specific resource
terraform state show aws_instance.web

# Move a resource (rename/refactor)
terraform state mv aws_instance.web aws_instance.app

# Remove resource from state (without destroying)
terraform state rm aws_instance.web

# Import existing resource into state
terraform import aws_instance.web i-1234567890abcdef0
```

## Workspace Commands

```bash
terraform workspace list
terraform workspace new staging
terraform workspace select staging
terraform workspace show
terraform workspace delete staging
```

## State Locking

DynamoDB table must have:
- Table name: matches `dynamodb_table` in backend config
- Primary key: `LockID` (string)
- Billing: on-demand or provisioned (min 5 RCU/WCU)

## Official Docs

- [S3 backend](https://developer.hashicorp.com/terraform/language/settings/backends/s3)
- [State management](https://developer.hashicorp.com/terraform/language/state)
- [Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces)
