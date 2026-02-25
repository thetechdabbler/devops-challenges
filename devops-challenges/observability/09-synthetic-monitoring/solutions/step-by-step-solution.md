# Step-by-Step Solution — Synthetic Monitoring

## Bug 1 — Module name mismatch

The Blackbox Exporter module is `http_200_ok` but Prometheus passes `module=http_2xx_check`. The name passed by Prometheus must exactly match the module defined in `blackbox.yml`.

```yaml
# blackbox.yml — define consistently
modules:
  http_2xx:  # pick one name

# prometheus.yml — use the same name
params:
  module: [http_2xx]
```

## Bug 2 — Invalid prober `https`

Valid probers are: `http`, `tcp`, `dns`, `icmp`, `grpc`. There is no `https` prober. HTTPS is just HTTP with TLS, handled via the `http` prober's `tls_config`.

```yaml
prober: http
```

## Bug 3 — `preferred_ip_protocol: ipv6`

On IPv4-only environments (most local setups, many cloud VMs), `ipv6` causes connection failures. Use `ip4`.

```yaml
preferred_ip_protocol: ip4
```

## Bug 4 — Wrong `source_labels` value `[target]`

`target` is not a Prometheus meta-label. The address of each target before relabeling is stored in `__address__`.

```yaml
# Wrong
source_labels: [target]

# Fixed
source_labels: [__address__]
```

## Bug 5 — Missing `__param_module` relabeling

Without this rule, the `module` label is not added to the scraped time series. It's used for dashboards and alerting to know which probe module fired.

```yaml
- source_labels: [__param_module]
  target_label: module
```

## Verify

```bash
docker compose up -d
curl "http://localhost:9115/probe?target=http://example.com&module=http_2xx"
# Look for probe_success 1
open http://localhost:9090/targets
```
