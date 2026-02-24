# Resources — Modules

## Module Sources

```hcl
# Local module
module "vpc" {
  source = "./modules/vpc"
}

# Terraform Registry
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
}

# GitHub
module "vpc" {
  source = "github.com/myorg/terraform-vpc"
}
```

## Module Variables and Outputs

```hcl
# modules/vpc/variables.tf
variable "cidr_block" {
  type        = string
  description = "VPC CIDR block"
}

variable "name" {
  type    = string
  default = "main"
}

# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.this.id
}

output "subnet_ids" {
  value = aws_subnet.public[*].id
}
```

## Using Module Outputs

```hcl
# Root module
module "vpc" {
  source     = "./modules/vpc"
  cidr_block = "10.0.0.0/16"
}

resource "aws_instance" "web" {
  subnet_id = module.vpc.subnet_ids[0]
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
```

## Official Docs

- [Module overview](https://developer.hashicorp.com/terraform/language/modules)
- [Module sources](https://developer.hashicorp.com/terraform/language/modules/sources)
- [Terraform Registry modules](https://registry.terraform.io/browse/modules)
