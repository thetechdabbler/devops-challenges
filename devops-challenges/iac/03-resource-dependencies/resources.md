# Resources — Resource Dependencies

## Implicit vs Explicit Dependencies

```hcl
# Implicit (preferred) — Terraform infers order from attribute references
resource "aws_instance" "web" {
  subnet_id              = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.web.id]
}

# Explicit — use when no attribute reference links resources
resource "aws_instance" "worker" {
  depends_on = [
    aws_nat_gateway.main,
    aws_route_table_association.private
  ]
}
```

## Common Reference Patterns

```hcl
# VPC → Subnet → EC2
resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }

resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id        # ← implicit dep
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "web" {
  subnet_id = aws_subnet.main.id      # ← implicit dep
}
```

## Terraform Graph

```bash
# Install graphviz
brew install graphviz      # macOS
apt install graphviz       # Ubuntu

# Generate SVG
terraform graph | dot -Tsvg > graph.svg
open graph.svg
```

## Official Docs

- [Resource dependencies](https://developer.hashicorp.com/terraform/language/resources/behavior#resource-dependencies)
- [depends_on](https://developer.hashicorp.com/terraform/language/meta-arguments/depends_on)
- [Graph command](https://developer.hashicorp.com/terraform/cli/commands/graph)
