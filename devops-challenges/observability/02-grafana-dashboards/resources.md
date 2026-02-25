# Resources — Grafana Dashboards

## Datasource Provisioning

```yaml
# grafana/provisioning/datasources/prometheus.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus        # not "prometheus-datasource"
    access: proxy           # not "direct"
    url: http://prometheus:9090
    uid: prometheus-ds
    isDefault: true
    jsonData:
      timeInterval: "15s"
```

## Dashboard Provisioning

```yaml
# grafana/provisioning/dashboards/default.yml
apiVersion: 1
providers:
  - name: default
    folder: DevOps
    type: file
    options:
      path: /var/lib/grafana/dashboards
```

## Panel Datasource Reference (Grafana 8+)

```json
{
  "datasource": {
    "type": "prometheus",
    "uid": "prometheus-ds"
  }
}
```

## Panel Types

| Type | Use case |
|------|----------|
| `timeseries` | Line/area time series (Grafana 8+) |
| `stat` | Single stat value |
| `gauge` | Gauge / speedometer |
| `table` | Tabular data |
| `barchart` | Bar charts |

## Official Docs

- [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Dashboard JSON model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
- [Panel types](https://grafana.com/docs/grafana/latest/panels-visualizations/)
