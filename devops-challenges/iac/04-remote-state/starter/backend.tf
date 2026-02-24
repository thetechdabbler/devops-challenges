terraform {
  backend "s3_bucket" {          # BUG 1: wrong backend type — should be "s3"
    bucket = "devops-tf-state"
    key    = "terraform.tfstate" # BUG 4: not workspace-aware — all workspaces share the same key
    # BUG 5: missing region — required for S3 backend
    # BUG 2: missing encrypt = true
    # BUG 3: missing dynamodb_table — no state locking
  }
}
