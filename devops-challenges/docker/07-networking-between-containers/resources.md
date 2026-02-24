# Resources — Networking Between Containers

## Useful Commands

```bash
# List all Docker networks
docker network ls

# Inspect a network — shows connected containers and their IPs
docker network inspect <network-name>

# Test connectivity from inside a container
docker compose exec app ping redis
docker compose exec app curl http://db:5432   # should get a response (not connection refused)

# Check if a port is open from the host
nc -z localhost 6379   # success
nc -z localhost 5432   # should fail (db not exposed to host)

# See which networks a container is on
docker inspect <container> --format='{{json .NetworkSettings.Networks}}' | jq 'keys'
```

## Custom Networks

```yaml
# docker-compose.yml
networks:
  frontend:
    driver: bridge   # default; omit to use bridge
  backend:
    driver: bridge

services:
  app:
    networks:
      - frontend
      - backend

  redis:
    networks:
      - frontend    # redis and app can talk; db cannot reach redis

  db:
    networks:
      - backend     # db and app can talk; redis cannot reach db
```

## ports vs expose

```yaml
# Accessible from host AND other containers on the same network
redis:
  ports:
    - "6379:6379"

# NOT accessible from host; accessible only to containers on the same network
# (expose is documentation only — omitting it has the same effect)
db:
  expose:
    - "5432"
```

## Official Docs

- [Docker networking overview](https://docs.docker.com/network/)
- [Compose networking](https://docs.docker.com/compose/networking/)
- [Bridge networks](https://docs.docker.com/network/drivers/bridge/)
