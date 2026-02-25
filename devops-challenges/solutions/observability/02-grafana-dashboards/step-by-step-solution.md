# Step-by-Step Solution — Grafana Dashboards

## Bug 1 — Wrong datasource type `prometheus-datasource`

The Grafana datasource plugin ID for Prometheus is simply `prometheus`.

```yaml
# Wrong
type: prometheus-datasource

# Fixed
type: prometheus
```

## Bug 2 — `access: direct` is deprecated

`direct` means the browser makes requests directly to Prometheus, bypassing Grafana's server. This breaks in most network configurations. Use `proxy` so Grafana's backend proxies the requests.

```yaml
access: proxy
```

## Bug 3 — Dashboard datasource name string instead of UID object

In Grafana 8+, panels reference datasources by UID object, not by name string. Using the name string causes "Datasource not found" errors.

```json
// Wrong
"datasource": "Prometheus"

// Fixed
"datasource": {
  "type": "prometheus",
  "uid": "prometheus-ds"
}
```

## Bug 4 — Invalid panel type `graph-panel`

`graph-panel` is not a valid Grafana panel type. The legacy type is `graph`; the modern replacement is `timeseries`.

```json
// Wrong
"type": "graph-panel"

// Fixed
"type": "timeseries"
```

## Bug 5 — `schemaVersion: 1` too low

Grafana rejects dashboard JSON with `schemaVersion` below 16. Current dashboards should use 36.

```json
"schemaVersion": 36
```

## Verify

```bash
docker compose up -d
open http://localhost:3000  # Dashboards > DevOps Overview should load
```
