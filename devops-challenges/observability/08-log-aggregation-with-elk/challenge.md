# Challenge — Log Aggregation with ELK

## Scenario

Your team uses Elasticsearch, Logstash/Filebeat, and Kibana (ELK) to aggregate and search application logs. A colleague configured Filebeat to ship logs to Elasticsearch, but got the Elasticsearch output host wrong, broke the index name template, and left Kibana pointing at the wrong ES host.

Fix the Filebeat and Kibana configurations so logs flow into Elasticsearch and are visible in Kibana.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Filebeat output host wrong** — `hosts: ["elasticsearch:9300"]` uses the transport port; Elasticsearch's HTTP API is on port `9200`
2. **Index name uses wrong variable** — `index: "filebeat-%{[agent.version]}-%{+YYYY.MM}"` uses a non-standard field; the conventional pattern uses `%{[agent.version]}` correctly but the date format should be `%{+yyyy.MM.dd}`
3. **`setup.kibana.host` wrong** — `host: "kibana:5061"` has a transposed digit; Kibana's default port is `5601`
4. **`filebeat.inputs` type wrong** — `type: logs_file` is not valid; the correct type for tailing log files is `type: log` (or `filestream` in Filebeat 7.16+)
5. **Missing `setup.ilm.enabled: false`** — without disabling ILM, Filebeat requires an ILM-capable cluster; for dev setups without ILM, explicitly set `setup.ilm.enabled: false`

## Acceptance Criteria

- [ ] Filebeat outputs to `elasticsearch:9200`
- [ ] Index pattern uses correct date format `%{+yyyy.MM.dd}`
- [ ] Kibana host is `kibana:5601`
- [ ] Input type is `log` or `filestream`
- [ ] ILM is disabled for dev mode

## Learning Notes

**Filebeat config:**
```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
    json.keys_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

setup.kibana:
  host: "kibana:5601"

setup.ilm.enabled: false
setup.template.name: "filebeat"
setup.template.pattern: "filebeat-*"
```
