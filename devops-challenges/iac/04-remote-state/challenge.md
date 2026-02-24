# Challenge — Remote State

## Scenario

Your team needs Terraform state to be shared across team members and CI/CD pipelines. A colleague set up an S3 backend configuration but the bucket name is wrong, encryption isn't enabled, state locking with DynamoDB is missing, and the workspace key isn't parameterized.

Fix the backend configuration so state is shared, encrypted, and locked during operations.

## Your Task

The file `starter/backend.tf` has **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Backend type wrong** — `backend "s3_bucket"` should be `backend "s3"`
2. **Missing `encrypt = true`** — state file stored unencrypted in S3
3. **Missing `dynamodb_table`** — no state locking, concurrent `terraform apply` runs can corrupt state
4. **Key not using workspace** — `key = "terraform.tfstate"` doesn't isolate state per workspace
5. **Region missing from backend** — S3 backend needs explicit `region` (can't inherit from provider)

## Acceptance Criteria

- [ ] `terraform init -reconfigure` succeeds and migrates state to S3
- [ ] S3 bucket uses server-side encryption for the state file
- [ ] DynamoDB table provides state locking
- [ ] Each workspace has its own isolated state key
- [ ] `terraform workspace new staging` creates a new isolated workspace

## Learning Notes

**S3 backend configuration:**
```hcl
terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "env/prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"   # LockID as primary key
  }
}
```

**Create the required AWS resources:**
```bash
# S3 bucket with versioning
aws s3api create-bucket --bucket my-terraform-state --region us-east-1
aws s3api put-bucket-versioning --bucket my-terraform-state \
  --versioning-configuration Status=Enabled

# DynamoDB table for locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```
