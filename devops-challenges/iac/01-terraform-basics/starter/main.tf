# BUG 1: missing terraform {} block with required_providers

provider "aws" {
  # BUG 2: missing region argument
}

resource "aws_instance_v2" "web" {  # BUG 3: resource type 'aws_instance_v2' doesn't exist
  ami = "ami_0c55b159cbfafe1f0"    # BUG 4: underscore instead of dash in AMI ID
  # BUG 5: missing required instance_type argument

  tags = {
    Name = "devops-web"
  }
}
