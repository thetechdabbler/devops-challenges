# Step-by-Step Solution — Remote State

## Bug 1 — Wrong backend type `s3_bucket`

The S3 backend type is simply `"s3"`. There is no `"s3_bucket"` type.

```hcl
# Wrong
backend "s3_bucket" { ... }

# Fixed
backend "s3" { ... }
```

## Bug 2 — Missing `encrypt = true`

S3 server-side encryption should always be enabled for state files containing sensitive resource attributes.

```hcl
encrypt = true
```

## Bug 3 — Missing `dynamodb_table`

Without a DynamoDB table for locking, multiple simultaneous `terraform apply` runs can corrupt state.

```hcl
dynamodb_table = "devops-tf-locks"
```

Create the table first:
```bash
aws dynamodb create-table \
  --table-name devops-tf-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Bug 4 — State key not workspace-aware

All workspaces shared the same `terraform.tfstate` key, causing them to overwrite each other.

```hcl
# Wrong
key = "terraform.tfstate"

# Fixed
key = "env:/${terraform.workspace}/terraform.tfstate"
```

## Bug 5 — Missing `region`

The S3 backend requires `region` to know where the bucket lives.

```hcl
region = "us-east-1"
```

## Verify

```bash
terraform init
terraform workspace new staging
terraform plan
```

State is stored at `s3://devops-tf-state/env:/staging/terraform.tfstate`.
