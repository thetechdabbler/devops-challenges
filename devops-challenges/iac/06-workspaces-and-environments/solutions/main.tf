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
    dev     = "t3.micro"    # FIX 5: key matches workspace name "dev"
    staging = "t3.small"
    prod    = "t3.large"    # FIX 5: key matches workspace name "prod"
  }
}

resource "aws_instance" "web" {
  count         = local.environment == "prod" ? 2 : 1        # FIX 4: == comparison
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = lookup(var.instance_types, local.environment, "t3.micro")  # FIX 1 & 2

  tags = {
    Name        = "devops-web-${count.index}"
    Environment = local.environment                           # FIX 3: dynamic tag
  }
}

output "environment" {
  value = local.environment
}
