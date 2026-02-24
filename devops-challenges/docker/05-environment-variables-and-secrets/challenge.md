# Challenge — Environment Variables and Secrets

## Scenario

Your company's Flask app needs to connect to a database and a third-party API. A junior developer hardcoded the database password directly in `app.py` and committed it to git. The security team caught it during a code review.

Your job: remove hardcoded credentials, inject configuration through environment variables, and use Docker secrets for sensitive values — all without breaking the running app.

---

## Problems to Fix

The starter files contain **five** issues:

1. Database password is hardcoded in the source code
2. `docker-compose.yml` passes secrets as plain environment variables
3. There is no `.env` file for local development defaults
4. The app reads `os.environ["DB_PASS"]` — it crashes if the variable is missing instead of failing gracefully
5. `.dockerignore` is missing, so `.env` files get copied into the image

---

## Tasks

1. Move all configuration values out of `app.py` into environment variables
2. Create a `.env` file with safe local development defaults (never commit real secrets)
3. Update `docker-compose.yml` to load the `.env` file and use Docker secrets for `DB_PASS`
4. Add a `secrets:` block in `docker-compose.yml` pointing to a local `db_password.txt` file
5. Update `app.py` to read the secret from the Docker secret file path (`/run/secrets/db_password`) with a fallback to the env var for local development
6. Create a `.dockerignore` that excludes `.env`, `.env.*` but keeps `.env.example`
7. Create a `.env.example` documenting all required variables without real values

---

## Acceptance Criteria

- [ ] `docker compose up` starts successfully with no hardcoded credentials in any source file
- [ ] `docker compose config` shows the secret mounted, not a plain env var
- [ ] `docker compose run app env | grep DB_PASS` returns nothing (secret is in a file, not an env var)
- [ ] The app responds to `GET /config` with the non-sensitive config values
- [ ] `.env` is in `.dockerignore` — building the image does not embed the `.env` file
- [ ] `.env.example` exists and documents every variable

---

## Learning Notes

### Environment variable precedence in Docker Compose

```
docker-compose.yml env_file → .env (auto-loaded) → shell environment → defaults in code
```

Compose automatically loads a `.env` file from the project root. Variables in `.env` fill in `${VAR}` placeholders in the compose file.

### Docker secrets vs environment variables

| | Env var | Docker secret |
|---|---|---|
| Visibility | `docker inspect`, logs, crash dumps | File at `/run/secrets/<name>` |
| Scope | Process and all children | Container only |
| Use case | Non-sensitive config | Passwords, tokens, keys |

### Reading a Docker secret in Python

```python
def read_secret(name, fallback=None):
    path = f"/run/secrets/{name}"
    try:
        with open(path) as f:
            return f.read().strip()
    except FileNotFoundError:
        return os.getenv(name.upper(), fallback)
```

### The 12-Factor App rule

Config that changes between environments (dev/staging/prod) belongs in environment variables, never in code. Secrets that should not appear in logs or inspect output belong in secret stores.
