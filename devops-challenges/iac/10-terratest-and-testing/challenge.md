# Challenge — Terratest and Testing

## Scenario

Your team writes automated tests for Terraform modules using Terratest (Go). A colleague started a test for the VPC module but got the import path wrong, used the wrong output fetch function, and left the test missing its cleanup call.

Fix the test file so it properly deploys the module, validates outputs, and tears down infrastructure after the test.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong Terratest import path** — `"github.com/gruntwork-io/terratest/modules/terraform"` is correct, but the starter uses `"github.com/gruntwork-io/terratest/terraform"` (missing `/modules/`)
2. **Missing `defer terraform.Destroy()`** — without deferred destroy, failed tests leave real AWS resources running
3. **Wrong output fetch function** — `terraform.Output()` returns a string; for a list output like `subnet_ids`, use `terraform.OutputList()`
4. **`t.Fatalf` instead of `assert`** — the test uses raw `t.Fatalf` but imports `testify/assert`; use `assert.NotEmpty()` for idiomatic Go test assertions
5. **`InitAndApply` instead of `InitAndApplyAndIdempotent`** — the starter only applies once; best practice is to also verify the plan is idempotent (second apply shows no changes)

## Acceptance Criteria

- [ ] Import path includes `/modules/terraform`
- [ ] `defer terraform.Destroy(t, terraformOptions)` is present
- [ ] `terraform.OutputList()` used for list outputs
- [ ] `assert.NotEmpty()` used for assertions
- [ ] Test runs `InitAndApplyAndIdempotent` to verify no drift

## Learning Notes

**Terratest structure:**
```go
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestVpcModule(t *testing.T) {
    t.Parallel()

    opts := &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "cidr_block": "10.0.0.0/16",
            "name":       "test-vpc",
        },
    }

    defer terraform.Destroy(t, opts)
    terraform.InitAndApplyAndIdempotent(t, opts)

    vpcID := terraform.Output(t, opts, "vpc_id")
    assert.NotEmpty(t, vpcID)

    subnetIDs := terraform.OutputList(t, opts, "subnet_ids")
    assert.Len(t, subnetIDs, 2)
}
```
