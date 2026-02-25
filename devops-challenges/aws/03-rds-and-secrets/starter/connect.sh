#!/bin/bash
set -euo pipefail

SECRET_ID="prod/db/password"

# BUG 4: wrong CLI command — should be get-secret-value
# BUG 5: missing | jq -r .password to extract password from JSON
PASSWORD=$(aws secretsmanager get-secret \
  --secret-id "$SECRET_ID" \
  --query SecretString \
  --output text)

DB_HOST=$(aws rds describe-db-instances \
  --db-instance-identifier devops-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

PGPASSWORD="$PASSWORD" psql \
  --host "$DB_HOST" \
  --user admin \
  --dbname postgres
