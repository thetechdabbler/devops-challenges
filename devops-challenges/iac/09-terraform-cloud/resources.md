# Resources — Terraform Cloud

## Cloud Block Syntax

```hcl
terraform {
  cloud {
    organization = "my-org"   # required

    workspaces {
      # Option A: single workspace by name
      name = "my-app-prod"

      # Option B: multiple workspaces by tag (mutually exclusive with name)
      # tags = ["app", "prod"]
    }
  }
}
```

## Authentication

```bash
# Interactive login (stores token in ~/.terraform.d/credentials.tfrc.json)
terraform login

# Environment variable (CI/CD)
export TF_TOKEN_app_terraform_io="<token>"

# .terraformrc credentials block
credentials "app.terraform.io" {
  token = "<token>"
}
```

## Common Commands

```bash
terraform init          # initializes cloud backend
terraform workspace list   # lists Cloud workspaces
terraform apply         # runs plan+apply remotely (default)
```

## Official Docs

- [Terraform Cloud overview](https://developer.hashicorp.com/terraform/cloud-docs)
- [cloud block](https://developer.hashicorp.com/terraform/language/terraform#terraform-cloud)
- [CLI-driven runs](https://developer.hashicorp.com/terraform/cloud-docs/run/cli)
