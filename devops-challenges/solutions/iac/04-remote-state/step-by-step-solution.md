# Solution — Remote State

## Fixes Applied

### Fix 1: Backend type must be `"s3"`

```hcl
# Before
backend "s3_bucket" {

# After
backend "s3" {
```

The Terraform S3 backend is named `"s3"`, not `"s3_bucket"`. An invalid backend name causes `terraform init` to fail with "Unknown backend type".

### Fix 2: Enable encryption

```hcl
encrypt = true
```

Without encryption, the tfstate file is stored as plaintext in S3. State files often contain sensitive data (passwords, private keys). `encrypt = true` enables server-side encryption using S3's default KMS key.

### Fix 3: Enable state locking with DynamoDB

```hcl
dynamodb_table = "terraform-state-lock"
```

Without a DynamoDB table, multiple team members or CI jobs running `terraform apply` simultaneously can corrupt the state file. DynamoDB provides a distributed lock that prevents concurrent operations.

### Fix 4: Use workspace-aware state key

```hcl
# Before
key = "terraform.tfstate"

# After
key = "devops-app/${terraform.workspace}/terraform.tfstate"
```

Using a workspace-aware key means each workspace (`dev`, `staging`, `prod`) gets its own isolated state file in S3. Without this, all workspaces share the same state — catastrophic if dev and prod use the same configuration.

### Fix 5: Add region to backend

```hcl
region = "us-east-1"
```

The S3 backend requires an explicit `region` argument. It cannot inherit the region from the `provider "aws"` block — backend configuration is evaluated before providers.

---

## Result

```bash
terraform init -reconfigure
# Initializes backend in S3 with locking

terraform workspace new staging
terraform apply
# State stored at: devops-app/staging/terraform.tfstate
```
