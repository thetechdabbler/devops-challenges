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

data "aws_ami" "amazon_linux" {     # FIX 1: correct data source type
  most_recent = true                # FIX 5: required when filter matches multiple AMIs
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]   # FIX 2: list value
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
  ami           = data.aws_ami.amazon_linux.id   # FIX 3: .id attribute
  instance_type = "t3.micro"
  subnet_id     = data.aws_vpc.main.id           # FIX 4: singular aws_vpc

  tags = {
    Name = "devops-web"
  }
}

output "ami_id" {
  value = data.aws_ami.amazon_linux.id
}
