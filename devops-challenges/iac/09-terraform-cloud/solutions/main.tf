terraform {
  cloud {
    organization = "my-devops-org"   # FIX 1: correct attribute name

    workspaces {                     # FIX 2: plural workspaces block
      name = "devops-app"            # FIX 3: use name OR tags, not both
    }

    # FIX 4: removed invalid token argument
    # Authenticate with: terraform login
    # Or set: export TF_TOKEN_app_terraform_io="<token>"
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
  type      = string
  sensitive = true    # FIX 5: mark sensitive variable
}

resource "aws_s3_bucket" "app" {
  bucket = "devops-app-state"
  tags   = { Environment = "prod" }
}
