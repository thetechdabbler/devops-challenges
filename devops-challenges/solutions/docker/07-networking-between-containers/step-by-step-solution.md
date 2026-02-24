# Solution — Networking Between Containers

## The Fixed Files

**docker-compose.yml:**
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

services:
  app:
    networks:
      - frontend
      - backend
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp

  redis:
    ports:
      - "6379:6379"
    networks:
      - frontend

  db:
    expose:
      - "5432"          # no host port mapping
    networks:
      - backend
```

---

## Fixes Applied

### Fix 1: Service names as hostnames

```
# Before (broken)
REDIS_URL=redis://localhost:6379

# After (correct)
REDIS_URL=redis://redis:6379
```

Each Docker container has its own `localhost`. When the app container tries `localhost:6379`, it's probing itself — Redis isn't there.

Docker Compose automatically registers DNS entries for each service name. Any container on the same network can resolve `redis` → Redis container's IP.

### Fix 2: Custom networks

```yaml
networks:
  frontend: {}
  backend: {}
```

The default bridge network connects all services, which is fine for small projects but provides no isolation. Custom networks let you control which services can communicate.

### Fix 3: Network segmentation

```
app → frontend (connects to redis)
app → backend  (connects to db)
redis → frontend only (cannot reach db)
db → backend only (cannot reach redis)
```

Redis cannot directly query Postgres and vice versa. A compromised Redis cannot pivot to the database network.

### Fix 4: Remove host port for Postgres

```yaml
# Before (exposes to host)
db:
  ports:
    - "5432:5432"

# After (internal only)
db:
  expose:
    - "5432"
```

Removing the `ports:` mapping means Postgres is not reachable from the host machine or the internet. It's only accessible from containers on the `backend` network.

`expose:` is documentation only — it doesn't change networking. Containers on the same network can always reach any port. Use it to communicate intent.

---

## Verification

```bash
# App can reach Redis
curl http://localhost:5000/cache-check

# App can reach Postgres
curl http://localhost:5000/db-check

# Postgres is NOT reachable from host
nc -z localhost 5432 || echo "correctly blocked"

# Redis IS reachable from host (for debugging)
nc -z localhost 6379 && echo "reachable"

# Confirm network membership
docker network inspect frontend | jq '.[0].Containers | keys'
docker network inspect backend  | jq '.[0].Containers | keys'
```
