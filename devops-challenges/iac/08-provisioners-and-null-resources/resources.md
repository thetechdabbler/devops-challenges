# Resources — Provisioners and Null Resources

## Provisioner Types

```hcl
# Run command locally (on the machine running terraform)
provisioner "local-exec" {
  command = "echo ${self.public_ip} >> inventory.txt"
}

# Run commands on the remote resource via SSH
provisioner "remote-exec" {
  inline = [
    "sudo apt-get update",
    "sudo apt-get install -y nginx",
  ]

  connection {
    type        = "ssh"
    host        = self.public_ip
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa")
  }
}
```

## Null Resource with Triggers

```hcl
terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

resource "null_resource" "bootstrap" {
  triggers = {
    instance_id = aws_instance.web.id   # re-runs when instance is replaced
  }

  provisioner "local-exec" {
    command = "ansible-playbook -i ${aws_instance.web.public_ip}, site.yml"
  }
}
```

## Official Docs

- [Provisioners overview](https://developer.hashicorp.com/terraform/language/resources/provisioners/syntax)
- [local-exec](https://developer.hashicorp.com/terraform/language/resources/provisioners/local-exec)
- [remote-exec](https://developer.hashicorp.com/terraform/language/resources/provisioners/remote-exec)
- [null_resource](https://registry.terraform.io/providers/hashicorp/null/latest/docs/resources/resource)
