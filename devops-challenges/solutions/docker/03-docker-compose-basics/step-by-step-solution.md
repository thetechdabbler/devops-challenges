# Solution — Docker Compose Basics

## The Completed docker-compose.yml

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

---

## Step-by-Step Explanation

### ports: "5000:5000"

Maps container port 5000 to host port 5000. Format is `"host:container"`. Without this, the container is running but unreachable from your machine.

### REDIS_URL=redis://redis:6379

The second `redis` is the service name — Docker's internal DNS resolves it to the Redis container's IP address automatically. This is the key insight of Compose networking: **service name = hostname**.

### depends_on: - redis

Tells Compose to start the `redis` container before `app`. This prevents the app from starting and immediately failing because Redis isn't up yet.

**Important limitation**: `depends_on` only waits for the container to start, not for Redis to be ready to accept connections. For production, add a healthcheck:

```yaml
redis:
  image: redis:7-alpine
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5

app:
  depends_on:
    redis:
      condition: service_healthy
```

### restart: unless-stopped

Restarts the container if it crashes, but not if you explicitly stopped it with `docker compose stop`. Other options: `no` (default), `always`, `on-failure`.

---

## Verifying It Works

```bash
docker compose up -d
docker compose ps          # Both services should be Up
curl http://localhost:5000/health   # {"status": "healthy"}
docker compose logs redis  # Should see "Ready to accept connections"
docker compose exec app sh
> ping redis               # Resolves by service name
```

---

## Production Tips

1. **Use `.env` for environment-specific values.** Compose automatically loads a `.env` file in the same directory. Keep secrets out of the compose file:
   ```
   # .env
   REDIS_PASSWORD=verysecure
   ```
   ```yaml
   environment:
     - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
   ```

2. **Use named volumes for persistent data.** Without a volume, Redis data is lost when the container is removed:
   ```yaml
   redis:
     image: redis:7-alpine
     volumes:
       - redis-data:/data

   volumes:
     redis-data:
   ```

3. **`docker compose down -v` deletes volumes.** Don't run this in production unless you intend to wipe the data.
