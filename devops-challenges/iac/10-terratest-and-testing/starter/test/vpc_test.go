package test

import (
	"testing"

	"github.com/gruntwork-io/terratest/terraform" // BUG 1: missing /modules/ in path
	"github.com/stretchr/testify/assert"
)

func TestVpcModule(t *testing.T) {
	t.Parallel()

	terraformOptions := &terraform.Options{
		TerraformDir: "../../modules/vpc",
		Vars: map[string]interface{}{
			"cidr_block": "10.0.0.0/16",
			"name":       "test-vpc",
		},
	}

	// BUG 2: missing defer terraform.Destroy(t, terraformOptions)
	// Without this, a test failure leaves AWS resources running

	terraform.InitAndApply(t, terraformOptions) // BUG 5: should be InitAndApplyAndIdempotent

	vpcID := terraform.Output(t, terraformOptions, "vpc_id")
	if vpcID == "" { // BUG 4: use assert.NotEmpty instead of manual check
		t.Fatalf("Expected vpc_id to be non-empty")
	}

	subnetIDs := terraform.Output(t, terraformOptions, "subnet_ids") // BUG 3: should be OutputList for list outputs
	assert.NotNil(t, subnetIDs)
}
