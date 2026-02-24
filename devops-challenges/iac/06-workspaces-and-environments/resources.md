# Resources — Workspaces and Environments

## Workspace Commands

```bash
# List workspaces
terraform workspace list

# Create and switch
terraform workspace new staging
terraform workspace select prod
terraform workspace show

# Current workspace in config
terraform.workspace  # built-in string
```

## Workspace-Aware Patterns

```hcl
locals {
  environment = terraform.workspace == "default" ? "dev" : terraform.workspace
}

variable "instance_types" {
  type = map(string)
  default = {
    dev     = "t3.micro"
    staging = "t3.small"
    prod    = "t3.large"
  }
}

# lookup with default fallback
instance_type = lookup(var.instance_types, local.environment, "t3.micro")

# conditional count
count = local.environment == "prod" ? 2 : 1
```

## Official Docs

- [Workspaces overview](https://developer.hashicorp.com/terraform/language/state/workspaces)
- [lookup() function](https://developer.hashicorp.com/terraform/language/functions/lookup)
- [Conditional expressions](https://developer.hashicorp.com/terraform/language/expressions/conditionals)
