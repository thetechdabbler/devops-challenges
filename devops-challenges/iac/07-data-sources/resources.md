# Resources — Data Sources

## Data Source Syntax

```hcl
# Fetch latest AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Fetch existing VPC by tag
data "aws_vpc" "main" {
  tags = {
    Name = "main-vpc"
  }
}

# Fetch subnet in VPC
data "aws_subnet" "main" {
  vpc_id = data.aws_vpc.main.id
  filter {
    name   = "tag:Tier"
    values = ["public"]
  }
}

# Use in resource
resource "aws_instance" "web" {
  ami       = data.aws_ami.amazon_linux.id
  subnet_id = data.aws_subnet.main.id
}
```

## Common Data Sources

| Data Source | Purpose |
|---|---|
| `aws_ami` | Look up an AMI by filter |
| `aws_vpc` | Find an existing VPC |
| `aws_subnet` | Find subnets in a VPC |
| `aws_caller_identity` | Get current AWS account ID |
| `aws_region` | Get current region |

## Official Docs

- [Data sources overview](https://developer.hashicorp.com/terraform/language/data-sources)
- [aws_ami data source](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ami)
- [aws_vpc data source](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc)
