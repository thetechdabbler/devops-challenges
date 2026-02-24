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

data "aws_ami_image" "amazon_linux" {    # BUG 1: wrong data source type — should be aws_ami
  # BUG 5: missing most_recent = true
  owners = ["amazon"]

  filter {
    name   = "name"
    values = "amzn2-ami-hvm-*-x86_64-gp2"   # BUG 2: must be a list ["..."]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "main" {
  tags = {
    Name = "main-vpc"
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.image_id   # BUG 3: attribute is .id not .image_id
  instance_type = "t3.micro"
  subnet_id     = data.aws_vpcs.main.id                # BUG 4: data.aws_vpcs (plural) should be data.aws_vpc

  tags = {
    Name = "devops-web"
  }
}

output "ami_id" {
  value = data.aws_ami.amazon_linux.id
}
