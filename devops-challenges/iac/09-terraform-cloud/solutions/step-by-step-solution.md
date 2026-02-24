# Step-by-Step Solution — Terraform Cloud

## Bug 1 — `org` should be `organization`

The `cloud {}` block requires the full attribute name `organization`. `org` is not recognized.

```hcl
# Wrong
org = "my-devops-org"

# Fixed
organization = "my-devops-org"
```

## Bug 2 — `workspace` should be `workspaces`

The nested block for selecting workspaces is `workspaces {}` (plural). `workspace {}` is not valid inside `cloud {}`.

```hcl
# Wrong
workspace { ... }

# Fixed
workspaces { ... }
```

## Bug 3 — `name` and `tags` cannot coexist in `workspaces {}`

You can select a single workspace by `name`, or select multiple workspaces by `tags`. Using both simultaneously is invalid.

```hcl
# Wrong
workspaces {
  name = "devops-app"
  tags = ["app", "prod"]
}

# Fixed — single workspace
workspaces {
  name = "devops-app"
}

# Fixed — multiple workspaces via tags
workspaces {
  tags = ["app", "prod"]
}
```

## Bug 4 — `token` is not a valid `cloud {}` argument

Terraform Cloud authentication is handled outside the configuration:
- Interactively: `terraform login`
- Environment variable: `export TF_TOKEN_app_terraform_io="<token>"`
- `.terraformrc` credentials block

Embedding tokens in `.tf` files is a security risk and will cause a validation error.

## Bug 5 — Missing `sensitive = true` on password variable

```hcl
variable "db_password" {
  type      = string
  sensitive = true
}
```

Without `sensitive = true`, Terraform will display the password value in plan output.

## Verify

```bash
export TF_TOKEN_app_terraform_io="<your-token>"
terraform init
terraform validate
```
