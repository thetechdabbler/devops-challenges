# 09 — Debugging a Broken Container

**Level**: Intermediate | **Topic**: Docker

Three containers with three different bugs. Use Docker's debugging toolkit to diagnose and fix each one.

## Quick Start

```bash
# Scenario 1: container exits immediately
cd starter/scenario-1
docker build -t debug-1 .
docker run --rm debug-1
docker logs $(docker ps -lq)   # what happened?

# Scenario 2: app returns 500
cd ../scenario-2
docker build -t debug-2 .
docker run -d --name debug-2 -p 5001:5000 debug-2
curl http://localhost:5001/health

# Scenario 3: app unreachable
cd ../scenario-3
docker build -t debug-3 .
docker run -d --name debug-3 -p 5002:5000 debug-3
curl http://localhost:5002/
```

See [`challenge.md`](./challenge.md) for the full debugging workflow and acceptance criteria.

## Solution

[`solutions/docker/09-debugging-a-broken-container/`](../../../solutions/docker/09-debugging-a-broken-container/)
