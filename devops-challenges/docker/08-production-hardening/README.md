# 08 — Production Hardening

**Level**: Advanced | **Topic**: Docker

Harden a Flask container for production: drop root privileges, make the filesystem read-only, drop unnecessary Linux capabilities, and add resource limits. Six issues to fix.

## Quick Start

```bash
cp ../../../../shared-resources/app/app.py starter/
cp ../../../../shared-resources/app/requirements.txt starter/
cd starter
docker compose up -d
docker compose exec app whoami   # should show appuser, not root
```

See [`challenge.md`](./challenge.md) for the full list of problems to fix.

## Solution

[`solutions/docker/08-production-hardening/`](../../../solutions/docker/08-production-hardening/)
