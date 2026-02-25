# Challenge — Grafana Dashboards

## Scenario

Your team provisions Grafana with a pre-built dashboard and data source via configuration files. A colleague wrote the Grafana datasource provisioning YAML and a dashboard JSON but got the data source type wrong, broke the UID reference, and left the dashboard with an invalid panel type.

Fix the provisioning files so Grafana loads the dashboard and connects to Prometheus on startup.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Wrong datasource `type`** — `type: prometheus-datasource` should be `type: prometheus`
2. **Wrong datasource `access` mode** — `access: direct` is deprecated/broken for server-side; should be `access: proxy`
3. **Dashboard `datasource` UID mismatch** — the panel references `datasource: "Prometheus"` (name) instead of `uid: "prometheus-ds"` matching the provisioned UID
4. **Invalid panel `type`** — `type: "graph-panel"` is not a valid Grafana panel type — should be `"graph"` (or `"timeseries"` in Grafana 8+)
5. **Dashboard `schemaVersion` too low** — `schemaVersion: 1` is outdated and causes import errors; minimum is `16`

## Acceptance Criteria

- [ ] Grafana starts and loads the provisioned datasource at startup
- [ ] Datasource type is `prometheus`, access is `proxy`
- [ ] Dashboard imports successfully
- [ ] Panel type is valid (`timeseries`)
- [ ] `schemaVersion` is 36 or higher

## Learning Notes

**Datasource provisioning (`datasources/prometheus.yml`):**
```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    uid: prometheus-ds
    isDefault: true
```

**Dashboard panel with UID-based datasource ref:**
```json
{
  "datasource": {
    "type": "prometheus",
    "uid": "prometheus-ds"
  },
  "type": "timeseries"
}
```
