# Challenge — Data Sources

## Scenario

Your team uses Terraform data sources to look up existing AWS resources rather than hardcoding IDs. A colleague wrote a configuration that fetches the latest Amazon Linux 2 AMI and an existing VPC, but got the filter syntax wrong, referenced the wrong attribute, and broke the data source type names.

Fix the configuration so it correctly fetches the AMI and VPC data, then uses them to create an EC2 instance.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong data source type** — `data "aws_ami_image"` should be `data "aws_ami"`
2. **Filter value must be a list** — `values = "amzn2-ami-hvm-*"` should be `values = ["amzn2-ami-hvm-*"]`
3. **Wrong AMI attribute** — `ami = data.aws_ami.amazon_linux.image_id` should be `.id` (the standard output attribute)
4. **Data source reference wrong** — `data.aws_vpcs.main.id` should be `data.aws_vpc.main.id` (singular resource name matches the data block label)
5. **Missing `most_recent = true`** — without this, Terraform errors when the AMI filter matches multiple images

## Acceptance Criteria

- [ ] `terraform validate` passes
- [ ] Data source fetches the latest Amazon Linux 2 AMI
- [ ] Instance uses `data.aws_ami.amazon_linux.id` for its AMI
- [ ] VPC lookup finds an existing VPC by tag
- [ ] `terraform plan` shows the instance referencing fetched data

## Learning Notes

**Data source syntax:**
```hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*"]
  }
}

data "aws_vpc" "main" {
  tags = {
    Name = "main-vpc"
  }
}

resource "aws_instance" "web" {
  ami       = data.aws_ami.amazon_linux.id
  subnet_id = data.aws_subnet.main.id
}
```
