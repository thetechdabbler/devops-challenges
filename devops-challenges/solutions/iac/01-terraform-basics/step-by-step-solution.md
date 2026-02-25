# Solution — Terraform Basics

## Fixes Applied

### Fix 1: Add `terraform {}` block with required_providers

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

Without this block, `terraform init` doesn't know which provider to download. The `source` identifies the provider on the Terraform Registry; `version` pins it.

### Fix 2: Add `region` to provider block

```hcl
provider "aws" {
  region = "us-east-1"
}
```

The AWS provider requires a region. Without it, Terraform falls back to `AWS_DEFAULT_REGION` environment variable — which may not be set, causing "No valid credential sources found" errors.

### Fix 3: Correct resource type

```hcl
# Before
resource "aws_instance_v2" "web"

# After
resource "aws_instance" "web"
```

`aws_instance_v2` doesn't exist. Terraform raises `An argument named "aws_instance_v2" is not expected here` during `terraform validate`.

### Fix 4: Fix AMI ID format

```hcl
# Before
ami = "ami_0c55b159cbfafe1f0"   # underscore

# After
ami = "ami-0c55b159cbfafe1f0"   # dash
```

AMI IDs always use dashes. An underscore causes "InvalidAMIID.Malformed" from the AWS API.

### Fix 5: Add `instance_type`

```hcl
instance_type = "t3.micro"
```

`instance_type` is a required argument for `aws_instance`. Without it, `terraform validate` fails with "Missing required argument".

---

## Result

```bash
$ terraform validate
Success! The configuration is valid.

$ terraform plan
Plan: 1 to add, 0 to change, 0 to destroy.
```
