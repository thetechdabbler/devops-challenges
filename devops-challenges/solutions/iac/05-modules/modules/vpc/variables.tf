variable "cidr_block" {  # FIX 1: declare required input variable
  type        = string
  description = "VPC CIDR block"
}

variable "name" {
  type    = string
  default = "main"
}
