# Step-by-Step Solution — Log Aggregation with ELK

## Bug 1 — Wrong Elasticsearch port (9300 vs 9200)

Port `9300` is Elasticsearch's internal transport protocol used for node-to-node cluster communication. Filebeat and all external clients use the HTTP REST API on port `9200`.

```yaml
# Wrong
hosts: ["elasticsearch:9300"]

# Fixed
hosts: ["elasticsearch:9200"]
```

## Bug 2 — Wrong date format in index name

`%{+YYYY.MM}` is missing the day part and uses uppercase `YYYY` which is not standard in Filebeat's Joda-time format. The conventional Filebeat index pattern is `%{+yyyy.MM.dd}` (lowercase, with day).

```yaml
# Wrong
index: "filebeat-%{[agent.version]}-%{+YYYY.MM}"

# Fixed
index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"
```

## Bug 3 — Kibana port transposed (5061 vs 5601)

Kibana listens on port `5601`. `5061` is not Kibana's port.

```yaml
# Wrong
host: "kibana:5061"

# Fixed
host: "kibana:5601"
```

## Bug 4 — Invalid input type `logs_file`

The Filebeat input type for tailing log files is `log` (classic) or `filestream` (Filebeat 7.16+). `logs_file` does not exist.

```yaml
# Wrong
type: logs_file

# Fixed
type: log
```

## Bug 5 — Missing `setup.ilm.enabled: false`

Index Lifecycle Management (ILM) requires an Elasticsearch cluster with ILM policies configured. In development setups, disable it explicitly to use simple index naming instead.

```yaml
setup.ilm.enabled: false
```

## Verify

```bash
docker compose up -d
sleep 30  # wait for ES to start
docker compose exec filebeat filebeat test output
open http://localhost:5601  # Kibana > Discover > filebeat-*
```
