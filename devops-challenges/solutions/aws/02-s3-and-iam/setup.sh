#!/bin/bash
set -euo pipefail

BUCKET="devops-artifacts"
REGION="us-east-1"

aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"

# FIX 4: enable public access block
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,\
BlockPublicPolicy=true,RestrictPublicBuckets=true

aws iam create-role \
  --role-name EC2S3ReadRole \
  --assume-role-policy-document file://trust-policy.json

aws iam put-role-policy \
  --role-name EC2S3ReadRole \
  --policy-name S3ReadPolicy \
  --policy-document file://iam-policy.json

echo "Setup complete"
