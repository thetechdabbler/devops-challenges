output "vpc_id" {  # FIX 2: expose vpc_id so root module can reference module.vpc.vpc_id
  value = aws_vpc.this.id
}

output "subnet_ids" {
  value = aws_subnet.public[*].id
}
