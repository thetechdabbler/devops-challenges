# Step-by-Step Solution — Provisioners and Null Resources

## Bug 1 — Wrong provisioner type `"exec"`

There is no provisioner called `exec`. The two standard provisioners are `local-exec` (runs locally) and `remote-exec` (runs on the resource via SSH).

```hcl
# Wrong
provisioner "exec" { ... }

# Fixed
provisioner "local-exec" { ... }
```

## Bug 2 — Missing `null` provider declaration

`null_resource` belongs to the `hashicorp/null` provider. Without declaring it in `required_providers`, `terraform init` won't download it and `null_resource` will be unrecognized.

```hcl
null = {
  source  = "hashicorp/null"
  version = "~> 3.0"
}
```

## Bug 3 — Connection uses `private_ip` instead of `public_ip`

When SSHing from your local machine (or a CI runner) to an EC2 instance, you need the public IP. The private IP is only reachable from inside the VPC.

```hcl
# Wrong
host = aws_instance.web.private_ip

# Fixed
host = aws_instance.web.public_ip
```

## Bug 4 — Trigger value is a resource object, not a string

`triggers` values must be strings. Referencing `aws_instance.web` gives the entire object. Use `.id`.

```hcl
# Wrong
instance_id = aws_instance.web

# Fixed
instance_id = aws_instance.web.id
```

## Bug 5 — `remote-exec` `inline` must be a list

`inline` expects a list of shell commands, not a bare string.

```hcl
# Wrong
inline = "sudo apt-get update -y"

# Fixed
inline = [
  "sudo apt-get update -y",
  "sudo apt-get install -y nginx",
]
```

## Verify

```bash
terraform init
terraform validate
terraform plan
```
