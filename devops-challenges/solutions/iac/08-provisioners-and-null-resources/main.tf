terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    null = {                          # FIX 2: declare null provider
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
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
    instance_id = aws_instance.web.id   # FIX 4: reference .id string attribute
  }

  provisioner "local-exec" {            # FIX 1: correct provisioner type
    command = "echo Instance ${aws_instance.web.public_ip} is ready"
  }

  provisioner "remote-exec" {
    inline = [                          # FIX 5: list of commands
      "sudo apt-get update -y",
      "sudo apt-get install -y nginx",
    ]

    connection {
      type        = "ssh"
      host        = aws_instance.web.public_ip   # FIX 3: public_ip for external SSH
      user        = "ubuntu"
      private_key = file("~/.ssh/id_rsa")
    }
  }
}
