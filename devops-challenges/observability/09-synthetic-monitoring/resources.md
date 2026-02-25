# Resources — Synthetic Monitoring

## Blackbox Exporter Modules

```yaml
modules:
  http_2xx:
    prober: http       # valid probers: http, tcp, dns, icmp, grpc
    timeout: 5s
    http:
      valid_status_codes: []  # defaults to 2xx
      method: GET
      preferred_ip_protocol: ip4
      follow_redirects: true
      tls_config:
        insecure_skip_verify: false

  tcp_connect:
    prober: tcp
    timeout: 5s

  dns_lookup:
    prober: dns
    dns:
      query_name: "example.com"
```

## Prometheus Blackbox Scrape Config

```yaml
- job_name: blackbox
  metrics_path: /probe
  params:
    module: [http_2xx]
  static_configs:
    - targets:
        - https://example.com
        - http://localhost:8080/healthz
  relabel_configs:
    # Move target URL to __param_target
    - source_labels: [__address__]
      target_label: __param_target
    # Use target URL as instance label
    - source_labels: [__param_target]
      target_label: instance
    # Route requests through blackbox exporter
    - target_label: __address__
      replacement: blackbox-exporter:9115
```

## Key Metrics

```promql
# Uptime (1 = up, 0 = down)
probe_success{job="blackbox"}

# HTTP status code
probe_http_status_code

# Response time
probe_duration_seconds

# SSL certificate expiry
probe_ssl_earliest_cert_expiry - time()
```

## Official Docs

- [Blackbox Exporter](https://github.com/prometheus/blackbox_exporter)
- [Blackbox config](https://github.com/prometheus/blackbox_exporter/blob/master/CONFIGURATION.md)
