# Challenge — Synthetic Monitoring

## Scenario

Your team uses the Prometheus Blackbox Exporter to probe HTTP endpoints and check their availability. A colleague wrote the Blackbox Exporter config and the Prometheus scrape config to probe your app, but got the module name wrong, used an invalid prober, and broke the relabeling rules.

Fix the configurations so the Blackbox Exporter probes your endpoints and Prometheus records uptime metrics.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Module name mismatch** — Prometheus scrapes `module=http_2xx_check` but the Blackbox config defines it as `http_200_ok` — names must match
2. **Invalid prober type** — `prober: https` is not valid; the prober for both HTTP and HTTPS is `http` (TLS is configured separately)
3. **`preferred_ip_protocol` wrong** — `preferred_ip_protocol: ipv6` causes failures on IPv4-only hosts; use `ip4`
4. **`relabel_configs` uses wrong source label** — `source_labels: [target]` should be `source_labels: [__address__]` to capture the probe target
5. **`__param_module` relabeling missing** — without setting `__param_module`, the scrape doesn't pass the module name to the Blackbox Exporter

## Acceptance Criteria

- [ ] Blackbox module named `http_2xx` (or consistent name used everywhere)
- [ ] Prober is `http`, not `https`
- [ ] `preferred_ip_protocol: ip4`
- [ ] Relabeling uses `__address__` as source label
- [ ] `__param_module` relabeling present

## Learning Notes

**Blackbox Exporter config:**
```yaml
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200, 201]
      method: GET
      preferred_ip_protocol: ip4
```

**Prometheus scrape config for blackbox:**
```yaml
- job_name: blackbox
  metrics_path: /probe
  params:
    module: [http_2xx]
  static_configs:
    - targets:
        - https://example.com
        - http://localhost:8080/health
  relabel_configs:
    - source_labels: [__address__]
      target_label: __param_target
    - source_labels: [__param_target]
      target_label: instance
    - target_label: __address__
      replacement: blackbox-exporter:9115
    - source_labels: [__param_module]
      target_label: module
```
