# Challenge — Workspaces and Environments

## Scenario

Your team uses Terraform workspaces to manage `dev`, `staging`, and `prod` environments from the same codebase. A colleague set up the configuration but got the workspace-aware variable lookup wrong, hard-coded environment names, and broke the locals block.

Fix the configuration so each workspace correctly selects its own instance type, replica count, and environment tag.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong locals syntax** — `local.env` should be `local.environment` — the locals block names the key `environment` but references use `env`
2. **`lookup()` missing default** — `lookup(var.instance_types, local.environment)` has no fallback and will error if the workspace key is missing
3. **Hardcoded environment tag** — `Environment = "dev"` instead of `Environment = local.environment`
4. **Wrong workspace comparison** — `terraform.workspace = "prod"` uses single `=` (assignment) instead of `==` (comparison) inside `count` expression
5. **Map key mismatch** — `var.instance_types` has key `"production"` but `terraform.workspace` is `"prod"` — keys must match workspace names

## Acceptance Criteria

- [ ] `terraform validate` passes
- [ ] `local.environment` correctly maps `default` workspace to `"dev"`
- [ ] `lookup()` falls back gracefully if workspace is unknown
- [ ] Instance count doubles in `prod` workspace
- [ ] Tags use `local.environment` not a hardcoded string

## Learning Notes

**Workspace-aware configuration:**
```hcl
locals {
  environment = terraform.workspace == "default" ? "dev" : terraform.workspace
}

variable "instance_types" {
  default = {
    dev     = "t3.micro"
    staging = "t3.small"
    prod    = "t3.large"
  }
}

resource "aws_instance" "web" {
  instance_type = lookup(var.instance_types, local.environment, "t3.micro")
  count         = local.environment == "prod" ? 2 : 1
}
```

**Workspace commands:**
```bash
terraform workspace new staging
terraform workspace select prod
terraform workspace list
```
