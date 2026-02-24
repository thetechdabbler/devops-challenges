terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

locals {
  environment = terraform.workspace == "default" ? "dev" : terraform.workspace
}

variable "instance_types" {
  type = map(string)
  default = {
    dev        = "t3.micro"
    staging    = "t3.small"
    production = "t3.large"   # BUG 5: key is "production" but workspace is named "prod"
  }
}

resource "aws_instance" "web" {
  count         = terraform.workspace = "prod" ? 2 : 1    # BUG 4: = should be ==
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = lookup(var.instance_types, local.env)   # BUG 1: local.env should be local.environment
                                                           # BUG 2: missing default in lookup()

  tags = {
    Name        = "devops-web-${count.index}"
    Environment = "dev"                                    # BUG 3: hardcoded — should be local.environment
  }
}

output "environment" {
  value = local.environment
}
