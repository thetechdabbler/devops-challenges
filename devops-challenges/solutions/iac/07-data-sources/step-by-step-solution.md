# Step-by-Step Solution — Data Sources

## Bug 1 — Wrong data source type `aws_ami_image`

The correct Terraform data source for AMIs is `aws_ami`. There is no `aws_ami_image` type.

```hcl
# Wrong
data "aws_ami_image" "amazon_linux" { ... }

# Fixed
data "aws_ami" "amazon_linux" { ... }
```

## Bug 2 — Filter value must be a list

All `filter` blocks in AWS data sources require `values` to be a **list of strings**, even when there is only one value.

```hcl
# Wrong
values = "amzn2-ami-hvm-*-x86_64-gp2"

# Fixed
values = ["amzn2-ami-hvm-*-x86_64-gp2"]
```

## Bug 3 — Wrong AMI attribute `.image_id`

The `aws_ami` data source exposes the AMI ID via the `.id` attribute. `.image_id` does not exist.

```hcl
# Wrong
ami = data.aws_ami.amazon_linux.image_id

# Fixed
ami = data.aws_ami.amazon_linux.id
```

## Bug 4 — `data.aws_vpcs` should be `data.aws_vpc`

The reference uses `aws_vpcs` (plural) but the data block is labeled `aws_vpc` (singular). The reference must match the declared label exactly.

```hcl
# Wrong
subnet_id = data.aws_vpcs.main.id

# Fixed
subnet_id = data.aws_vpc.main.id
```

## Bug 5 — Missing `most_recent = true`

When a filter matches multiple AMIs (which `amzn2-ami-hvm-*` always does), Terraform requires `most_recent = true` to select the latest one. Without it, Terraform errors: _"Your query returned more than one result."_

```hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  ...
}
```

## Verify

```bash
terraform init
terraform validate
terraform plan
```
