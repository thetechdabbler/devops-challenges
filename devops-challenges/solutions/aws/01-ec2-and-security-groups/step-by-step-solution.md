# Step-by-Step Solution — EC2 and Security Groups

## Bug 1 — Wrong flag `--image` vs `--image-id`

The EC2 `run-instances` command requires `--image-id`, not `--image`.

```bash
# Wrong
--image ami-0c55b159cbfafe1f0

# Fixed
--image-id ami-0c55b159cbfafe1f0
```

## Bug 2 — SSH port 2222 instead of 22

SSH uses TCP port 22. Port 2222 is a non-standard alternative that won't work with default SSH clients unless the server is explicitly configured for it.

```bash
--port 22
```

## Bug 3 — HTTP rule allows all protocols and all ports

`--protocol all --port -1` opens every port to the world. HTTP only needs port 80/tcp.

```bash
# Wrong
--protocol all --port -1

# Fixed
--protocol tcp --port 80
```

## Bug 4 — Wrong instance profile flag

`--instance-profile` is not a valid flag. The correct flag is `--iam-instance-profile` with `Name=` or `Arn=`.

```bash
# Wrong
--instance-profile MyEC2Role

# Fixed
--iam-instance-profile Name=MyEC2Role
```

## Bug 5 — User data must be passed via `file://`

Inline shell scripts with newlines in CLI arguments often fail silently. Use `file://` to point to a script file.

```bash
# Wrong
--user-data "#!/bin/bash\napt-get update -y"

# Fixed
--user-data file://userdata.sh
```

## Verify

```bash
bash solutions/launch.sh
aws ec2 describe-instances --filters "Name=tag:Name,Values=devops-web" \
  --query 'Reservations[].Instances[].{ID:InstanceId,State:State.Name}'
```

## Cleanup

```bash
aws ec2 terminate-instances --instance-ids $INSTANCE_ID
aws ec2 delete-security-group --group-id $SG_ID
```
