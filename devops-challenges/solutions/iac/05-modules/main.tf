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

module "vpc" {
  source = "./modules/vpc"  # FIX 4: correct plural path

  cidr_block = "10.0.0.0/16"  # FIX 3: correct argument name
  name       = "prod-vpc"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = module.vpc.subnet_ids[0]
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "web_instance_id" {
  value = aws_instance.web.id
}
