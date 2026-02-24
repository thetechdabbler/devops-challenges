# Resources — Environment Variables and Secrets

## Useful Commands

```bash
# Print resolved compose config (shows what variables expand to)
docker compose config

# Show environment inside a running container
docker compose run app env

# List secrets visible to a running service
docker compose exec app ls /run/secrets/

# Read a secret value from inside the container
docker compose exec app cat /run/secrets/db_password
```

## Docker Compose .env Behaviour

Compose automatically reads `.env` from the project root. Variables defined there fill `${VAR}` placeholders in `docker-compose.yml`. They do NOT automatically become container environment variables — you must explicitly pass them with `environment:` or `env_file:`.

```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env          # loads all vars in .env into the container
    environment:
      - APP_ENV=${APP_ENV}   # or pick individual vars from shell / .env
```

## Docker Secrets (Compose v3)

```yaml
secrets:
  db_password:
    file: ./db_password.txt   # local file for dev; use external: true for Swarm/prod

services:
  app:
    secrets:
      - db_password
    # secret is mounted read-only at /run/secrets/db_password inside the container
```

## .dockerignore Template

```
.git
.gitignore
.env
.env.*
!.env.example
__pycache__
*.pyc
.venv
venv/
```

## Official Docs

- [Docker Compose env_file](https://docs.docker.com/compose/environment-variables/env-file/)
- [Docker Compose secrets](https://docs.docker.com/compose/use-secrets/)
- [12-Factor App — Config](https://12factor.net/config)
- [Docker secrets overview](https://docs.docker.com/engine/swarm/secrets/)
