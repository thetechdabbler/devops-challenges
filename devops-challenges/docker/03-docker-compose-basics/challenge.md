# Challenge 03 — Docker Compose Basics

**Topic**: Docker | **Level**: Beginner

---

## Challenge Statement

The sample app needs a Redis instance for session caching. Right now, your teammate starts Redis with one `docker run` command and the app with another, manually passing the Redis IP address each time. When Redis restarts, the IP changes and the app breaks. Every new developer has to figure out the exact `docker run` commands and flags.

Docker Compose solves this: define all your services in one file, start them together with a single command, and let Docker handle networking so services find each other by name.

---

## Goal

Complete the provided `starter/docker-compose.yml` so that both the Flask app and Redis start with `docker compose up`, the app can reach Redis using the service name `redis`, and the setup is reproducible for any developer with one command.

---

## Prerequisites

- Docker Desktop running
- Completed exercise 01 (understand Dockerfile basics)
- The sample app from `shared-resources/app/` copied into `starter/`

---

## Tasks

1. Copy the sample app files into `starter/`:
   ```bash
   cp ../../../../shared-resources/app/app.py starter/
   cp ../../../../shared-resources/app/requirements.txt starter/
   ```

2. Open `starter/docker-compose.yml` and complete all the `TODO` sections:
   - Add a `ports` mapping for the app (`5000:5000`)
   - Add the `REDIS_URL` environment variable pointing to the `redis` service
   - Add `depends_on` so the app waits for Redis
   - Expose Redis port `6379` for local debugging

3. Start the stack:
   ```bash
   cd starter
   docker compose up
   ```

4. In a second terminal, verify both services are running:
   ```bash
   docker compose ps
   ```

5. Test the app responds:
   ```bash
   curl http://localhost:5000/health
   ```

6. Check logs for both services:
   ```bash
   docker compose logs app
   docker compose logs redis
   ```

7. Open a shell in the app container and ping Redis by service name:
   ```bash
   docker compose exec app sh
   # Inside the container:
   ping redis
   ```

8. Stop and remove everything:
   ```bash
   docker compose down
   ```

---

## Acceptance Criteria

- [ ] `docker compose up` starts both services without errors
- [ ] `docker compose ps` shows both `app` and `redis` as running
- [ ] `curl http://localhost:5000/health` returns `{"status": "healthy"}`
- [ ] `docker compose logs redis` shows Redis ready output
- [ ] `docker compose exec app ping redis` resolves — containers reach each other by service name
- [ ] `docker compose down` cleanly stops and removes both containers

---

## Learning Notes

### Why Compose?

Without Compose, running a multi-container app requires memorizing multiple `docker run` commands with exact flags. Compose captures all of that in a single `docker-compose.yml` that lives in version control alongside your code.

### Service discovery by name

When Docker Compose starts services, it creates a private network and registers each service's name as a DNS hostname. The `app` container can reach `redis` at the hostname `redis` — no IPs, no configuration needed.

This is why `REDIS_URL=redis://redis:6379` works: the second `redis` is the hostname, resolved automatically by Docker's internal DNS.

### depends_on

`depends_on` tells Compose to start `redis` before `app`. However, it only waits for the container to start, not for Redis to be ready to accept connections. For production, combine it with a `healthcheck` on the Redis service.

### Compose networking

Compose automatically creates a network named `<project>_default` and attaches all services to it. Services on the same network can reach each other by service name. You don't need to define a network explicitly unless you need isolation between groups of services.

---

## Resources

- [Docker Compose overview](https://docs.docker.com/compose/)
- [Compose file reference](https://docs.docker.com/compose/compose-file/)
- [Networking in Compose](https://docs.docker.com/compose/networking/)
- [docker compose CLI reference](https://docs.docker.com/engine/reference/commandline/compose/)
