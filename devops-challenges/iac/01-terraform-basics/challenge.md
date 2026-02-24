# Challenge — Terraform Basics

## Scenario

You've inherited a Terraform configuration that's supposed to provision an AWS EC2 instance. When you run `terraform plan` it fails with provider errors, and `terraform apply` has never successfully run — the instance was created manually instead.

Fix the configuration so `terraform plan` succeeds and accurately describes the EC2 instance.

## Your Task

The file `starter/main.tf` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Missing required provider block** — `terraform {}` block doesn't declare the `aws` provider
2. **Provider region missing** — `provider "aws" {}` block has no `region` argument
3. **Wrong resource type** — `resource "aws_instance_v2"` doesn't exist (should be `aws_instance`)
4. **Invalid AMI ID format** — `ami = "ami_12345"` uses underscore instead of dash (`ami-12345678`)
5. **Missing required `instance_type`** — EC2 instance resource requires `instance_type`

## Acceptance Criteria

- [ ] `terraform init` downloads the AWS provider successfully
- [ ] `terraform validate` passes with no errors
- [ ] `terraform plan` shows exactly 1 resource to add (the EC2 instance)
- [ ] No `terraform.tfstate` file exists before first apply (clean state)
- [ ] `terraform fmt` reports no formatting issues

## Learning Notes

**Terraform file structure:**
```hcl
# terraform.tf — required provider declarations
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# main.tf — resources
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "devops-web"
  }
}
```

**Key commands:**
```bash
terraform init      # download providers
terraform validate  # check syntax
terraform plan      # preview changes
terraform apply     # apply changes
terraform destroy   # tear down all resources
terraform fmt       # format code
```
