# Challenge — S3 and IAM

## Scenario

Your team stores deployment artifacts in S3 and uses an IAM role to grant EC2 instances read-only access. A colleague wrote the S3 bucket policy and IAM role trust policy but got the principal ARN format wrong, used the wrong action for object reads, left the bucket publicly accessible, and made the policy condition wrong.

Fix the policies so the EC2 role can read from S3 and the bucket is private.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **IAM trust policy `Service` wrong** — `"ec2.amazonaws.com"` should be `"ec2.amazonaws.com"` ✓ but the `Action` is `"sts:AssumeRole"` but the starter has `"sts:Assume"` (missing `Role`)
2. **S3 bucket policy `Action` wrong** — `"s3:GetObjects"` should be `"s3:GetObject"` (no plural)
3. **Bucket policy `Resource` missing wildcard** — `"arn:aws:s3:::devops-artifacts"` only grants access to the bucket itself; for objects use `"arn:aws:s3:::devops-artifacts/*"`
4. **Bucket has `PublicAccessBlockConfiguration` disabled** — `BlockPublicAcls: false` should be `true` to enforce bucket privacy
5. **IAM policy `Effect` wrong** — `"Effect": "Deny"` in the read policy should be `"Allow"`

## Acceptance Criteria

- [ ] IAM trust policy `Action` is `sts:AssumeRole`
- [ ] S3 action is `s3:GetObject`
- [ ] Resource ARN includes `/*` suffix for objects
- [ ] Public access block is enabled
- [ ] IAM policy Effect is `Allow`

## Learning Notes

**IAM role trust policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

**S3 IAM policy for read access:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::devops-artifacts",
      "arn:aws:s3:::devops-artifacts/*"
    ]
  }]
}
```
