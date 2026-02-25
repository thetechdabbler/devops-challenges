# Step-by-Step Solution — Modules

## Bug 1 — Module missing `variable "cidr_block"`

**File:** `starter/modules/vpc/variables.tf`

The root module calls `module "vpc"` with `cidr_block = "10.0.0.0/16"` but the VPC module never declared that variable. Terraform will error: _"An argument named 'cidr_block' is not expected here."_

```hcl
# Add to modules/vpc/variables.tf
variable "cidr_block" {
  type        = string
  description = "VPC CIDR block"
}
```

## Bug 2 — Module outputs.tf is empty

**File:** `starter/modules/vpc/outputs.tf`

The root module references `module.vpc.vpc_id` and `module.vpc.subnet_ids[0]` but the VPC module's `outputs.tf` is empty. Terraform will error: _"Unsupported attribute; This object does not have an attribute named 'vpc_id'."_

```hcl
# Add to modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.this.id
}

output "subnet_ids" {
  value = aws_subnet.public[*].id
}
```

## Bug 3 — Wrong argument name in root module call

**File:** `starter/main.tf`

```hcl
# Wrong
cidr = "10.0.0.0/16"

# Fixed
cidr_block = "10.0.0.0/16"
```

The module's input variable is named `cidr_block`. Passing `cidr` will fail with: _"An argument named 'cidr' is not expected here."_

## Bug 4 — Wrong module source path

**File:** `starter/main.tf`

```hcl
# Wrong
source = "./module/vpc"

# Fixed
source = "./modules/vpc"
```

The directory is `modules/` (plural) but the source references `module/` (singular). Terraform will error during `terraform init`: _"There is no module at the given path."_

## Bug 5 — Missing `required_providers` in root module

**File:** `starter/main.tf`

The root module must declare the AWS provider in a `terraform { required_providers {} }` block so that `terraform init` knows which provider plugin to download. Without it, the `aws_instance` and `aws_vpc` resources have no provider to initialize.

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

## Verify

```bash
terraform init
terraform validate
terraform plan
```

All five fixes together produce a clean `validate` pass and a valid plan.
