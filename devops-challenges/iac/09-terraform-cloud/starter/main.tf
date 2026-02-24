terraform {
  cloud {
    org = "my-devops-org"    # BUG 1: wrong attribute — should be organization

    workspace {              # BUG 2: should be workspaces (plural)
      name = "devops-app"
      tags = ["app", "prod"]   # BUG 3: cannot use name and tags together
    }

    token = "my-token-here"  # BUG 4: token is not a valid argument in cloud {}
                              # Use: terraform login OR TF_TOKEN_app_terraform_io env var
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "db_password" {
  type = string
  # BUG 5: missing sensitive = true
}

resource "aws_s3_bucket" "app" {
  bucket = "devops-app-state"
  tags   = { Environment = "prod" }
}
