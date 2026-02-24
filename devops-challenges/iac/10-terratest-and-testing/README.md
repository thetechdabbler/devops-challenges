# Exercise 10 — Terratest and Testing

Fix a Terratest Go test for a Terraform VPC module so it correctly deploys, validates, and tears down infrastructure.

## Quick Start

```bash
cd starter/test
go mod tidy
go test -v -timeout 30m
```

## Files

```
starter/
  test/
    vpc_test.go    — Terratest file (5 bugs)
    go.mod
solutions/
  test/
    vpc_test.go    — fixed test
  step-by-step-solution.md
```
