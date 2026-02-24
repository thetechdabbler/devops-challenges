# Challenge — Networking Between Containers

## Scenario

A team built a multi-service app: a Flask API, a Redis cache, and a Postgres database — all in separate containers. They ran each container with `docker run` and tried to connect them via `localhost`. Nothing works because each container has its own network namespace.

Your job: wire up all three services using Docker Compose networks so they can communicate by service name, and isolate the database from being accessible on the host machine.

---

## Problems to Fix

The starter files contain **five** issues:

1. The app tries to connect to Redis on `localhost:6379` — should use the service name `redis`
2. The app tries to connect to Postgres on `localhost:5432` — should use the service name `db`
3. All services share Docker's default bridge network — no isolation
4. The Postgres port `5432` is exposed to the host — it should only be reachable from other containers
5. There is no custom network defined — services should use a named network for clarity

---

## Tasks

1. Fix the Redis and Postgres connection URLs in `app.py` to use service names as hostnames
2. Define two custom networks in `docker-compose.yml`:
   - `frontend`: connects `app` and `redis`
   - `backend`: connects `app` and `db`
3. Attach each service to only the networks it needs
4. Remove the host port mapping for Postgres — it should not be reachable from outside Docker
5. Keep the Redis port accessible on the host for debugging (port `6379`)

---

## Acceptance Criteria

- [ ] `curl http://localhost:5000/db-check` returns a success response (app can reach Postgres)
- [ ] `curl http://localhost:5000/cache-check` returns a success response (app can reach Redis)
- [ ] `nc -z localhost 5432` fails — Postgres is not reachable from the host
- [ ] `nc -z localhost 6379` succeeds — Redis is reachable from the host for debugging
- [ ] `docker network ls` shows `frontend` and `backend` networks
- [ ] `docker network inspect frontend` does NOT show the `db` service

---

## Learning Notes

### Container DNS

Docker Compose creates a DNS entry for each service using its service name. Within the same network, containers resolve each other by name:

```
redis://redis:6379      ← service name "redis", port 6379
postgresql://db:5432    ← service name "db", port 5432
```

You never use `localhost` to talk to a different container — `localhost` refers to the container's own loopback.

### Custom networks

```yaml
networks:
  frontend: {}
  backend: {}

services:
  app:
    networks:
      - frontend
      - backend
  redis:
    networks:
      - frontend
  db:
    networks:
      - backend
```

Services on different networks cannot reach each other even if they're in the same compose file. The `db` service only joins `backend` — `redis` cannot reach it.

### ports vs expose

```yaml
services:
  redis:
    ports:
      - "6379:6379"     # maps host:container — reachable from host and other containers

  db:
    expose:
      - "5432"          # only accessible from other containers on the same network
                        # (expose is actually optional — containers can reach any port
                        #  on the same network regardless)
```

`ports:` punches a hole in the host firewall. `expose:` is documentation only — use it to signal intent, but don't rely on it for security. Real isolation comes from custom networks.
