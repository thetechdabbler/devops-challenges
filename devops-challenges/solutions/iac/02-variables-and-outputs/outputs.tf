output "instance_ip" {
  value       = aws_instance.web[*].public_ip
  description = "Public IPs of the web instances"
}

output "instance_id" {
  value       = aws_instance.web[*].id
  description = "EC2 instance IDs"
}

output "db_password" {
  value       = var.db_password
  description = "Database password"
  sensitive   = true
}
