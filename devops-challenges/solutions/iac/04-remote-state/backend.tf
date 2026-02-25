terraform {
  backend "s3" {
    bucket         = "devops-tf-state"
    key            = "devops-app/${terraform.workspace}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
