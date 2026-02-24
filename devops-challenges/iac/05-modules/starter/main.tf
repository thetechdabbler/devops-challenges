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
  source = "./module/vpc"     # BUG 4: wrong path — should be ./modules/vpc (plural)

  cidr = "10.0.0.0/16"       # BUG 3: wrong argument name — should be cidr_block
  name = "prod-vpc"
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
