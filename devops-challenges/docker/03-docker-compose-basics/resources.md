# Resources — Docker Compose Basics

## Compose File Structure

```yaml
version: "3.9"        # Compose file format version

services:             # Define each container here
  app:                # Service name (also its DNS hostname on the network)
    build: .          # Build from Dockerfile in current dir
    image: myapp:1.0  # OR use a pre-built image
    ports:
      - "host:container"
    environment:
      - KEY=value
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:              # Named volumes (optional)
  redis-data:

networks:             # Custom networks (optional)
  backend:
```

## Essential Commands

```bash
# Start all services (foreground)
docker compose up

# Start in background (detached)
docker compose up -d

# View running services
docker compose ps

# View logs
docker compose logs
docker compose logs -f app      # Follow logs for one service

# Execute command in running container
docker compose exec app sh

# Stop and remove containers + networks
docker compose down

# Stop and remove including volumes
docker compose down -v

# Rebuild images before starting
docker compose up --build
```

## Service Discovery

Containers in the same Compose network reach each other using the **service name** as hostname:

```
app → redis   via  redis:6379
app → db      via  db:5432
worker → app  via  app:5000
```

## Official Docs

- [Compose getting started](https://docs.docker.com/compose/gettingstarted/)
- [Compose file reference v3](https://docs.docker.com/compose/compose-file/compose-file-v3/)
- [depends_on](https://docs.docker.com/compose/compose-file/compose-file-v3/#depends_on)
