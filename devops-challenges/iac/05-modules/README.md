# Exercise 05 — Modules

Fix a reusable VPC Terraform module and the root module that calls it.

## Quick Start

```bash
terraform init   # resolves the local module
terraform validate
terraform plan
```

## Files

```
starter/
  main.tf                    — root module (2 bugs)
  modules/vpc/
    main.tf                  — VPC resources
    variables.tf             — module inputs (1 bug)
    outputs.tf               — module outputs (1 bug)
solutions/
  main.tf
  modules/vpc/...            — fixed module
```
