variable "instance_type" {
  type    = string           # FIX 1: add type constraint
  default = "t3.micro"
}

variable "instance_count" {
  type    = number
  default = 1               # FIX 2: number literal, not string "1"
}

variable "environment" {
  type    = string
  default = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)  # FIX 5: == to contains()
    error_message = "Environment must be dev, staging, or prod."
  }
}
