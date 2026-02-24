# Resources — Terraform Basics

## Terraform CLI Commands

```bash
terraform init       # Initialize working directory, download providers
terraform validate   # Validate configuration syntax
terraform plan       # Show execution plan (no changes made)
terraform apply      # Apply changes
terraform destroy    # Destroy all managed resources
terraform fmt        # Format code to canonical style
terraform show       # Show current state
terraform output     # Show output values
terraform state list # List all resources in state
```

## Provider Block

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = "us-east-1"
}
```

## AWS Instance Resource

```hcl
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"   # Amazon Linux 2 us-east-1
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = aws_subnet.main.id

  tags = {
    Name        = "my-instance"
    Environment = "dev"
  }
}
```

## AWS Authentication

```bash
# Option 1: Environment variables
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1

# Option 2: AWS credentials file (~/.aws/credentials)
# Option 3: IAM Role (recommended for CI/CD)
```

## Official Docs

- [Terraform AWS provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [aws_instance resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance)
- [Terraform CLI reference](https://developer.hashicorp.com/terraform/cli)
