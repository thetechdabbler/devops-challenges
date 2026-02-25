# Step-by-Step Solution — S3 and IAM

## Bug 1 — Trust policy `Action` is `sts:Assume` not `sts:AssumeRole`

The STS action that allows a service to assume a role is `sts:AssumeRole`. `sts:Assume` doesn't exist.

```json
"Action": "sts:AssumeRole"
```

## Bug 2 — IAM policy `Effect` is `Deny` instead of `Allow`

A permissions policy with `Effect: Deny` explicitly blocks the actions listed. Change to `Allow`.

```json
"Effect": "Allow"
```

## Bug 3 — S3 action `s3:GetObjects` (plural) doesn't exist

The correct S3 action is `s3:GetObject` (singular). The pluralised form is not a valid IAM action and will be silently ignored.

```json
"s3:GetObject"
```

## Bug 4 — Public access block disabled

`BlockPublicAcls=false` leaves the bucket open to public access via ACLs. All four block settings should be `true` to enforce private access.

```bash
BlockPublicAcls=true,IgnorePublicAcls=true,\
BlockPublicPolicy=true,RestrictPublicBuckets=true
```

## Bug 5 — Resource ARN needs `/*` for object-level access

`arn:aws:s3:::devops-artifacts` grants access to bucket-level actions (like `s3:ListBucket`). For object-level actions (`s3:GetObject`), the resource must be `arn:aws:s3:::devops-artifacts/*`.

Both should be listed in the policy — one for the bucket, one for objects:
```json
"Resource": [
  "arn:aws:s3:::devops-artifacts",
  "arn:aws:s3:::devops-artifacts/*"
]
```

_(The starter already has both — but the action was wrong in Bug 3, and missing the `/*` was described here for context.)_

## Verify

```bash
bash solutions/setup.sh
aws s3 cp test.txt s3://devops-artifacts/
aws s3 cp s3://devops-artifacts/test.txt /tmp/
```
