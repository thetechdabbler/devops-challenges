# Challenge — Logging with Loki

## Scenario

Your team uses Grafana Loki with Promtail to collect and query application logs. A colleague wrote the Promtail configuration and Loki config but got the Loki push URL wrong, used an invalid pipeline stage type, and broke the job label name.

Fix the configurations so Promtail ships logs to Loki and they are queryable in Grafana.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong Loki push URL** — `url: http://loki:3100/api/v1/push` should be `http://loki:3100/loki/api/v1/push` (missing `loki/` prefix)
2. **Invalid pipeline stage** — `- json_parse:` is not a valid Promtail stage — should be `- json:` with `expressions` map
3. **Missing `labels` in scrape config** — the `static_configs` entry has no `labels` block so logs won't have a `job` label for querying
4. **Loki `auth_enabled` wrong type** — `auth_enabled: "false"` is a string; should be boolean `false`
5. **Promtail `positions` path missing directory** — `filename: positions.yaml` is a relative path; should be an absolute path like `/tmp/positions.yaml`

## Acceptance Criteria

- [ ] Promtail ships logs to `http://loki:3100/loki/api/v1/push`
- [ ] Logs are labelled with `job="devops-app"`
- [ ] Loki starts with `auth_enabled: false`
- [ ] JSON log fields are parsed via `- json:` pipeline stage
- [ ] Positions file uses absolute path

## Learning Notes

**Promtail config structure:**
```yaml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: app
    static_configs:
      - targets: [localhost]
        labels:
          job: devops-app
          __path__: /var/log/app/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            msg: message
      - labels:
          level:
```
