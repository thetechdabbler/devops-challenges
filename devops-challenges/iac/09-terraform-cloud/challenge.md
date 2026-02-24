# Challenge — Terraform Cloud

## Scenario

Your team is migrating from local state to Terraform Cloud for remote execution and state management. A colleague started writing the `cloud` block configuration but got the organization name field wrong, mixed up `workspace` and `workspaces`, and left the variable sensitivity flag incorrect.

Fix the Terraform Cloud configuration so it connects to the right organization and workspace.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong block attribute** — `org` should be `organization` inside the `cloud {}` block
2. **`workspace` (singular) should be `workspaces`** — the nested block for targeting workspaces is `workspaces {}`, not `workspace {}`
3. **`name` and `tags` cannot coexist** — you can target a workspace by `name` OR by `tags`, not both simultaneously
4. **Missing `TF_TOKEN_app_terraform_io` guidance** — the starter sets `token` inline but Terraform Cloud auth uses an env var or `credentials` block in `.terraformrc`, not a `token` argument in the `cloud {}` block
5. **Sensitive variable not marked sensitive** — `variable "db_password"` is missing `sensitive = true`

## Acceptance Criteria

- [ ] `terraform init` connects to Terraform Cloud
- [ ] `cloud {}` block uses `organization`, not `org`
- [ ] `workspaces {}` block uses either `name` or `tags`, not both
- [ ] Sensitive variable has `sensitive = true`
- [ ] `terraform validate` passes

## Learning Notes

**Terraform Cloud block:**
```hcl
terraform {
  cloud {
    organization = "my-org"

    workspaces {
      name = "my-workspace"
      # OR use tags to target multiple workspaces:
      # tags = ["app", "prod"]
    }
  }
}
```

**Authentication:**
```bash
# Login interactively
terraform login

# Or set environment variable
export TF_TOKEN_app_terraform_io="<your-token>"
```
