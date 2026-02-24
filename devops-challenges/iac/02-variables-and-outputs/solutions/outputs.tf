output "instance_ip" {
  value = aws_instance.web[*].public_ip  # FIX 3: add required value argument
}

output "db_password" {
  value     = var.db_password
  sensitive = true                        # FIX 4: mark sensitive output
}
