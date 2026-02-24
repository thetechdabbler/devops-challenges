# Resources — Terratest and Testing

## Terratest Basics

```go
import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestModule(t *testing.T) {
    t.Parallel()

    opts := &terraform.Options{
        TerraformDir: "../",
        Vars: map[string]interface{}{
            "region": "us-east-1",
        },
    }

    // Always clean up
    defer terraform.Destroy(t, opts)

    // Apply and verify idempotency
    terraform.InitAndApplyAndIdempotent(t, opts)

    // Fetch outputs
    vpcID    := terraform.Output(t, opts, "vpc_id")       // string
    subnetIDs := terraform.OutputList(t, opts, "subnet_ids") // []string

    assert.NotEmpty(t, vpcID)
    assert.Len(t, subnetIDs, 2)
}
```

## Running Tests

```bash
# Run all tests in directory
go test -v -timeout 30m ./...

# Run specific test
go test -v -run TestVpcModule -timeout 30m

# Skip destroy for debugging
SKIP_TEARDOWN=true go test -v -timeout 30m
```

## go.mod

```
module github.com/myorg/terraform-tests

go 1.21

require (
    github.com/gruntwork-io/terratest v0.46.0
    github.com/stretchr/testify v1.8.4
)
```

## Official Docs

- [Terratest docs](https://terratest.gruntwork.io/)
- [Terratest GitHub](https://github.com/gruntwork-io/terratest)
- [terraform module functions](https://pkg.go.dev/github.com/gruntwork-io/terratest/modules/terraform)
