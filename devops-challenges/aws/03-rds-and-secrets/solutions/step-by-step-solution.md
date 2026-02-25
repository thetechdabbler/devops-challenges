# Step-by-Step Solution — RDS and Secrets Manager

## Bug 1 — `EngineVersion: "15"` needs patch version

RDS requires a specific engine version including the minor/patch number. `"15"` is rejected by CloudFormation.

```yaml
EngineVersion: "15.4"
```

## Bug 2 — `PubliclyAccessible: true`

Production databases should never have a public IP. Set to `false` and access via a bastion host or VPN.

```yaml
PubliclyAccessible: false
```

## Bug 3 — Parameter group family mismatch

`postgres14` is for PostgreSQL 14.x. Since the engine is version 15, the family must be `postgres15`.

```yaml
DBParameterGroupFamily: postgres15
```

## Bug 4 — Wrong CLI command `get-secret` vs `get-secret-value`

The Secrets Manager CLI command to retrieve a secret's value is `get-secret-value`. `get-secret` is not a valid subcommand.

```bash
aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" \
  --query SecretString \
  --output text
```

## Bug 5 — Secret JSON not parsed

The secret is stored as a JSON object `{"username":"admin","password":"..."}`. Without `jq`, the raw JSON string is assigned to `$PASSWORD`, causing the `psql` connection to fail with an invalid password.

```bash
... | jq -r .password
```

## Verify

```bash
aws cloudformation validate-template --template-body file://solutions/rds.yml
aws cloudformation deploy \
  --template-file solutions/rds.yml \
  --stack-name devops-rds
```

## Cleanup

```bash
aws cloudformation delete-stack --stack-name devops-rds
```
