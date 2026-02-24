# Step-by-Step Solution — Terraform Basics

## Bug 1 — Missing `terraform {}` block

The `terraform {}` block is required to declare which provider plugins Terraform should download. Without it, `terraform init` doesn't know to fetch the AWS provider.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

## Bug 2 — Missing `region` in provider block

The AWS provider requires a region. Without it, Terraform errors: _"The argument 'region' is required."_

```hcl
provider "aws" {
  region = "us-east-1"
}
```

## Bug 3 — Wrong resource type `aws_instance_v2`

The correct resource type is `aws_instance`. There is no `aws_instance_v2` type in the AWS provider.

```hcl
# Wrong
resource "aws_instance_v2" "web" { ... }

# Fixed
resource "aws_instance" "web" { ... }
```

## Bug 4 — Underscore in AMI ID

AMI IDs use hyphens, not underscores: `ami-0c55b159cbfafe1f0` not `ami_0c55b159cbfafe1f0`.

```hcl
ami = "ami-0c55b159cbfafe1f0"
```

## Bug 5 — Missing `instance_type`

`instance_type` is a required argument for `aws_instance`. Terraform will error without it.

```hcl
instance_type = "t3.micro"
```

## Verify

```bash
terraform init
terraform validate
terraform plan
```
