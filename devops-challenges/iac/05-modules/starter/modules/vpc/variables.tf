# BUG 1: missing variable "cidr_block" — root module passes cidr_block but it is not declared here

variable "name" {
  type    = string
  default = "main"
}
