terraform {                          # FIX 1: add required terraform block
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"             # FIX 2: add required region argument
}

resource "aws_instance" "web" {    # FIX 3: correct resource type (was aws_instance_v2)
  ami           = "ami-0c55b159cbfafe1f0"  # FIX 4: hyphen not underscore in AMI ID
  instance_type = "t3.micro"       # FIX 5: add required instance_type argument

  tags = {
    Name = "devops-web"
  }
}
