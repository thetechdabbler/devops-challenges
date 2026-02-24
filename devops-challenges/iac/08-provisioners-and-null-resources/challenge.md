# Challenge — Provisioners and Null Resources

## Scenario

Your team uses `null_resource` with `local-exec` and `remote-exec` provisioners to run scripts after resources are created. A colleague wrote a configuration to bootstrap an EC2 instance, but got the connection block wrong, used an invalid provisioner type, and broke the `triggers` map.

Fix the configuration so the provisioner runs correctly after instance creation.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong provisioner type** — `"exec"` should be `"local-exec"` — there is no `exec` provisioner
2. **`null_resource` missing provider** — `null_resource` requires the `null` provider declared in `required_providers`
3. **Connection block uses wrong attribute** — `host = aws_instance.web.private_ip` should be `public_ip` for SSH from outside the VPC
4. **Trigger value not a string** — `triggers = { instance_id = aws_instance.web }` should reference `.id`
5. **`remote-exec` inline must be a list** — `inline = "sudo apt-get update"` should be `inline = ["sudo apt-get update"]`

## Acceptance Criteria

- [ ] `terraform validate` passes
- [ ] `null_resource` triggers re-run when instance ID changes
- [ ] `local-exec` provisioner prints instance IP locally
- [ ] `remote-exec` connects via SSH and runs commands on the instance
- [ ] Connection block uses `public_ip`

## Learning Notes

**Provisioner pattern:**
```hcl
resource "null_resource" "bootstrap" {
  triggers = {
    instance_id = aws_instance.web.id
  }

  provisioner "local-exec" {
    command = "echo Instance ${aws_instance.web.public_ip} is ready"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get install -y nginx",
    ]

    connection {
      type        = "ssh"
      host        = aws_instance.web.public_ip
      user        = "ubuntu"
      private_key = file("~/.ssh/id_rsa")
    }
  }
}
```

> **Note:** Provisioners are a last resort. Prefer cloud-init, user_data, or configuration management tools (Ansible) when possible.
