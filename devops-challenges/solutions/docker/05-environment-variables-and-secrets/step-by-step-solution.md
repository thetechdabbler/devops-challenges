# Solution — Environment Variables and Secrets

## The Optimized Files

**app.py (key changes):**
```python
def read_secret(name, fallback=None):
    path = f"/run/secrets/{name}"
    try:
        with open(path) as f:
            return f.read().strip()
    except FileNotFoundError:
        return os.getenv(name.upper(), fallback)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PASS = read_secret("db_password", fallback="changeme")
```

**docker-compose.yml:**
```yaml
secrets:
  db_password:
    file: ./db_password.txt

services:
  app:
    env_file:
      - .env
    secrets:
      - db_password
```

**.env (not committed — in .gitignore):**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_NAME=myapp
APP_ENV=development
```

**.env.example (committed — documents required vars):**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_NAME=myapp
APP_ENV=development
APP_PORT=5000
```

---

## Fixes Applied

### Fix 1: Remove hardcoded credentials from source

```python
# Before
DB_PASS = "super_secret_password_123"

# After
DB_PASS = read_secret("db_password", fallback="changeme")
```

Credentials in source code get committed to git and end up in every clone, CI log, and container image history. The secret file approach keeps them out of all three.

### Fix 2: Implement read_secret()

```python
def read_secret(name, fallback=None):
    path = f"/run/secrets/{name}"
    try:
        with open(path) as f:
            return f.read().strip()
    except FileNotFoundError:
        return os.getenv(name.upper(), fallback)
```

The function checks for a Docker secret file first. If it doesn't exist (local dev without secrets), it falls back to an env var. This makes the code work in both contexts without changes.

### Fix 3: Docker secrets block in compose

```yaml
secrets:
  db_password:
    file: ./db_password.txt   # local dev only; production uses external: true

services:
  app:
    secrets:
      - db_password
```

Docker mounts the file content at `/run/secrets/db_password` inside the container. It does not appear in `docker inspect`, env output, or crash dumps.

### Fix 4: env_file directive

```yaml
services:
  app:
    env_file:
      - .env
```

Loads all variables from `.env` into the container environment. Non-sensitive config (DB_HOST, APP_ENV) lives here. Sensitive values live in secrets.

### Fix 5: .dockerignore excludes .env

```
.env
.env.*
!.env.example
```

Without this, `COPY . .` embeds your `.env` file into the image layer. Anyone who pulls the image can read it with `docker history` or by running the image.

### Fix 6: .env.example

`.env.example` is committed to git and documents every variable without real values. New developers copy it to `.env` and fill in their local values.

---

## Verification

```bash
# Secret is NOT in environment
docker compose run app env | grep -i pass   # no output

# Secret is accessible via file
docker compose exec app cat /run/secrets/db_password   # prints the value

# Config endpoint returns non-sensitive values only
curl http://localhost:5000/config
```

---

## Production Note

For production Kubernetes or Docker Swarm deployments, use external secret stores:

```yaml
# Docker Swarm
secrets:
  db_password:
    external: true   # managed by `docker secret create`

# Kubernetes — use a Secret volume mount or an operator like External Secrets
```
