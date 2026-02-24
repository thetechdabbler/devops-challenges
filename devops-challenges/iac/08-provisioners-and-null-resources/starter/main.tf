terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    # BUG 2: missing null provider declaration
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami                         = "ami-0c55b159cbfafe1f0"
  instance_type               = "t3.micro"
  associate_public_ip_address = true

  tags = { Name = "devops-web" }
}

resource "null_resource" "bootstrap" {
  triggers = {
    instance_id = aws_instance.web    # BUG 4: missing .id — must be a string
  }

  provisioner "exec" {               # BUG 1: wrong provisioner type — should be local-exec
    command = "echo Instance ${aws_instance.web.public_ip} is ready"
  }

  provisioner "remote-exec" {
    inline = "sudo apt-get update -y"   # BUG 5: must be a list ["..."]

    connection {
      type        = "ssh"
      host        = aws_instance.web.private_ip   # BUG 3: should be public_ip
      user        = "ubuntu"
      private_key = file("~/.ssh/id_rsa")
    }
  }
}
