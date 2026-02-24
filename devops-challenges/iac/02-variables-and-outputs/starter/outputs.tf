output "instance_ip" {
  # BUG 3: missing value = argument
  description = "Public IP of the web instance"
}

output "instance_id" {
  value       = aws_instance.web.id
  description = "EC2 instance ID"
}

output "db_password" {
  value       = var.db_password
  description = "Database password"
  # BUG 4: missing sensitive = true — secret printed in plain text
}
