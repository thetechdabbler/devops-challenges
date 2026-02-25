terraform {
  backend "s3" {                                           # FIX 1: correct backend type
    bucket         = "devops-tf-state"
    key            = "env:/${terraform.workspace}/terraform.tfstate"  # FIX 4: workspace-aware key
    region         = "us-east-1"                          # FIX 5: required region
    encrypt        = true                                 # FIX 2: encrypt at rest
    dynamodb_table = "devops-tf-locks"                    # FIX 3: enable state locking
  }
}
