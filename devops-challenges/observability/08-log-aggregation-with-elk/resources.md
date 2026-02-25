# Resources — Log Aggregation with ELK

## Filebeat Config

```yaml
filebeat.inputs:
  - type: log               # or "filestream" (Filebeat 7.16+)
    enabled: true
    paths:
      - /var/log/app/*.log
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]   # HTTP port, not transport (9300)
  index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

setup.kibana:
  host: "kibana:5601"

setup.ilm.enabled: false
setup.template.name: "filebeat"
setup.template.pattern: "filebeat-*"
```

## Elasticsearch Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 9200 | HTTP | REST API (used by Filebeat, Kibana) |
| 9300 | TCP | Node-to-node transport (cluster internal) |

## Kibana Index Pattern Creation

```bash
# Via API
curl -X POST "kibana:5601/api/saved_objects/index-pattern" \
  -H "kbn-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{"attributes":{"title":"filebeat-*","timeFieldName":"@timestamp"}}'
```

## Official Docs

- [Filebeat configuration](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-configuration.html)
- [Elasticsearch output](https://www.elastic.co/guide/en/beats/filebeat/current/elasticsearch-output.html)
- [Filebeat input types](https://www.elastic.co/guide/en/beats/filebeat/current/configuration-filebeat-options.html)
