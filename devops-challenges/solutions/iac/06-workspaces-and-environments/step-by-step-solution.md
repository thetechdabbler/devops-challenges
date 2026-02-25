# Step-by-Step Solution — Workspaces and Environments

## Bug 1 — `local.env` should be `local.environment`

The locals block defines `environment` but the lookup references `local.env` which doesn't exist.

```hcl
# Wrong
lookup(var.instance_types, local.env)

# Fixed
lookup(var.instance_types, local.environment, "t3.micro")
```

## Bug 2 — `lookup()` missing default

Without a third argument, `lookup()` errors if the key is missing from the map. Always provide a safe default.

```hcl
lookup(var.instance_types, local.environment, "t3.micro")
```

## Bug 3 — Hardcoded environment tag

The `Environment` tag was hardcoded to `"dev"`, ignoring the active workspace.

```hcl
# Wrong
Environment = "dev"

# Fixed
Environment = local.environment
```

## Bug 4 — Single `=` in count conditional

`=` is assignment in HCL. Use `==` for equality comparison inside expressions.

```hcl
# Wrong
count = terraform.workspace = "prod" ? 2 : 1

# Fixed
count = local.environment == "prod" ? 2 : 1
```

## Bug 5 — Map key `"production"` doesn't match workspace name `"prod"`

Workspace names are user-defined. If your workspace is named `prod`, the map key must be `"prod"`.

```hcl
# Wrong
production = "t3.large"

# Fixed
prod = "t3.large"
```

## Verify

```bash
terraform init
terraform workspace new prod
terraform validate
terraform plan  # should show count = 2 and instance_type = t3.large
```
