package test

import (
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform" // FIX 1: correct import path with /modules/
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

	defer terraform.Destroy(t, terraformOptions) // FIX 2: always clean up, even on failure

	terraform.InitAndApplyAndIdempotent(t, terraformOptions) // FIX 5: verify no drift on second apply

	vpcID := terraform.Output(t, terraformOptions, "vpc_id")
	assert.NotEmpty(t, vpcID) // FIX 4: idiomatic testify assertion

	subnetIDs := terraform.OutputList(t, terraformOptions, "subnet_ids") // FIX 3: OutputList for []string
	assert.Len(t, subnetIDs, 2)
}
