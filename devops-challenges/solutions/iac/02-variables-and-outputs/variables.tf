variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.micro"

  validation {
    condition     = can(regex("^t3\\.", var.instance_type))
    error_message = "Only t3.* instance types are allowed."
  }
}

variable "instance_count" {
  type        = number
  description = "Number of instances to launch"
  default     = 1
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "dev"

  validation {
    condition     = var.environment == "dev" || var.environment == "prod"
    error_message = "environment must be dev or prod."
  }
}
