# Step-by-Step Solution — Logging with Loki

## Bug 1 — Wrong Loki push URL

The Loki HTTP API for log ingestion is at `/loki/api/v1/push`. The `/api/v1/push` path (without the `loki/` prefix) returns a 404.

```yaml
# Wrong
url: http://loki:3100/api/v1/push

# Fixed
url: http://loki:3100/loki/api/v1/push
```

## Bug 2 — Invalid pipeline stage `json_parse`

The Promtail JSON parsing stage is named `json`, not `json_parse`. The stage takes an `expressions` map.

```yaml
# Wrong
- json_parse:
    level: level

# Fixed
- json:
    expressions:
      level: level
      msg: message
```

## Bug 3 — Missing `labels` block in `static_configs`

Without `labels`, scraped logs have no `job` label and no `__path__` to tell Promtail which files to tail.

```yaml
static_configs:
  - targets: [localhost]
    labels:
      job: devops-app
      __path__: /var/log/*.log
```

## Bug 4 — `auth_enabled` as string instead of boolean

YAML parses `"false"` as the string `"false"`, which Loki may interpret as truthy. Use the bare YAML boolean `false`.

```yaml
# Wrong
auth_enabled: "false"

# Fixed
auth_enabled: false
```

## Bug 5 — Relative path for positions file

Promtail requires an absolute path for the positions file. A relative path fails when the working directory changes at startup.

```yaml
# Wrong
filename: positions.yaml

# Fixed
filename: /tmp/positions.yaml
```

## Verify

```bash
docker compose up -d
# In Grafana > Explore > select Loki > run: {job="devops-app"}
```
