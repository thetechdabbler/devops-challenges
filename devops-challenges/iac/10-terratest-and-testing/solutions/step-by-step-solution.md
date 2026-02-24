# Step-by-Step Solution — Terratest and Testing

## Bug 1 — Wrong import path

The Terratest Terraform module lives at `github.com/gruntwork-io/terratest/modules/terraform`. The starter omits `/modules/`.

```go
// Wrong
"github.com/gruntwork-io/terratest/terraform"

// Fixed
"github.com/gruntwork-io/terratest/modules/terraform"
```

## Bug 2 — Missing `defer terraform.Destroy()`

Without a deferred Destroy call, a test panic or assertion failure will leave real AWS resources (VPCs, subnets) running and incurring cost. `defer` ensures cleanup runs even if the test fails.

```go
defer terraform.Destroy(t, terraformOptions)
```

Place this **before** `InitAndApply` so it's registered regardless of what happens next.

## Bug 3 — `terraform.Output()` used for a list output

`terraform.Output()` returns a single string. For outputs declared as `list` or `tuple` in Terraform (like `subnet_ids`), use `terraform.OutputList()` which returns `[]string`.

```go
// Wrong
subnetIDs := terraform.Output(t, terraformOptions, "subnet_ids")

// Fixed
subnetIDs := terraform.OutputList(t, terraformOptions, "subnet_ids")
```

## Bug 4 — Raw `t.Fatalf` instead of `assert`

Since `assert` from `testify` is imported, use it consistently. `assert.NotEmpty()` is clearer and idiomatic.

```go
// Wrong
if vpcID == "" {
    t.Fatalf("Expected vpc_id to be non-empty")
}

// Fixed
assert.NotEmpty(t, vpcID)
```

## Bug 5 — `InitAndApply` instead of `InitAndApplyAndIdempotent`

`InitAndApplyAndIdempotent` applies the module twice. If the second `terraform plan` shows no changes, the module is idempotent — a critical property for reliable infrastructure modules.

```go
// Wrong
terraform.InitAndApply(t, terraformOptions)

// Fixed
terraform.InitAndApplyAndIdempotent(t, terraformOptions)
```

## Verify

```bash
cd starter/test
go mod tidy
go test -v -run TestVpcModule -timeout 30m
```
