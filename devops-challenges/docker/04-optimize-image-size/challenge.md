# Challenge 04 — Optimize Image Size

**Topic**: Docker | **Level**: Intermediate

---

## Challenge Statement

A CI/CD audit flagged your Docker image: it's 1.2GB, takes 4 minutes to push to the registry, and 3 minutes to pull on a cold deployment. Deployments are painfully slow and your team is frustrated. The image was written in a hurry and nobody looked at the size. Your job is to audit and fix every inefficiency.

---

## Goal

Identify and fix all size-related anti-patterns in `starter/Dockerfile`. Reduce the final image to **under 150MB** without changing the app's functionality.

---

## Prerequisites

- Docker Desktop running
- Completed exercises 01–02 (Dockerfile basics and multi-stage)
- The sample app from `shared-resources/app/` copied into `starter/`

---

## Tasks

1. Copy the sample app files:
   ```bash
   cp ../../../../shared-resources/app/app.py starter/
   cp ../../../../shared-resources/app/requirements.txt starter/
   ```

2. Build the original image and note its size:
   ```bash
   cd starter
   docker build -t devops-app:fat .
   docker image ls devops-app:fat
   ```

3. Audit the layers:
   ```bash
   docker history devops-app:fat
   ```
   Identify which layers are biggest and why.

4. Find and fix **all** of the following anti-patterns in the Dockerfile:
   - Wrong base image (hint: you don't need Ubuntu to run Python)
   - Unnecessary packages installed (vim, git, wget have no place in a runtime image)
   - Separate `RUN apt-get update` and `RUN apt-get install` commands
   - No apt cache cleanup after install
   - `COPY . .` without a `.dockerignore` (copies `.git/`, `__pycache__/`, etc.)
   - `pip install` without `--no-cache-dir`

5. Create a `.dockerignore` file to exclude non-essential files.

6. Build the optimized image:
   ```bash
   docker build -t devops-app:lean .
   docker image ls devops-app:lean
   ```

7. Verify the app still works:
   ```bash
   docker run -p 5000:5000 devops-app:lean
   curl http://localhost:5000/health
   ```

---

## Acceptance Criteria

- [ ] Final image is under 150MB (`docker image ls devops-app:lean`)
- [ ] `curl http://localhost:5000/health` returns `{"status": "healthy"}`
- [ ] A `.dockerignore` file exists in `starter/`
- [ ] `docker history devops-app:lean` shows no `vim`, `git`, `wget`, `gcc` layers
- [ ] `apt-get update` and `apt-get install` are in the **same** `RUN` instruction
- [ ] Apt cache is cleaned up in the same `RUN` instruction

---

## Learning Notes

### Why base image matters most

`ubuntu:22.04` is ~77MB compressed, but inflates to ~230MB unpacked — and then you add Python on top. `python:3.11-slim` starts with Python already included and weighs ~130MB. Choosing the right base image is the single biggest lever.

### Chain RUN commands

```dockerfile
# BAD — creates 2 layers, update layer is cached separately
RUN apt-get update
RUN apt-get install -y curl

# GOOD — one layer, always fresh, cache is cleaned up
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
```

The `rm -rf /var/lib/apt/lists/*` is critical. apt downloads package metadata to this directory during `update`. Without cleaning it, those files stay in the layer forever.

### --no-install-recommends

Tells apt not to install recommended (non-essential) packages. Often cuts apt installs in half.

### The .dockerignore file

Without `.dockerignore`, `COPY . .` copies everything including:
- `.git/` (your entire git history)
- `__pycache__/` and `*.pyc`
- Local `.env` files
- `node_modules/` if present
- Test fixtures and local data

A minimal `.dockerignore`:
```
.git
__pycache__
*.pyc
.env
.venv
*.egg-info
```

### pip --no-cache-dir

pip caches downloaded packages in `~/.cache/pip`. Inside a Docker build, that cache is useless (it's discarded after the layer) but still takes up space in the layer if you don't pass `--no-cache-dir`.

---

## Resources

- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [.dockerignore reference](https://docs.docker.com/engine/reference/builder/#dockerignore-file)
- [dive — layer inspector tool](https://github.com/wagoodman/dive)
- [docker history](https://docs.docker.com/engine/reference/commandline/history/)
