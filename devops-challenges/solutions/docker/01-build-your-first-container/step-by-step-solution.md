# Solution — Build Your First Container

## The Completed Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

## Step-by-Step Walkthrough

### Step 1: Choose a base image

```dockerfile
FROM python:3.11-slim
```

**Why `python:3.11-slim` and not `python:3.11`?**

The `python:3.11` image is about 1GB — it includes build tools, documentation, and many packages you never need at runtime. The `-slim` variant strips most of that down to ~130MB by including only what's needed to run Python.

There's also `python:3.11-alpine` (~50MB), but Alpine uses a different C library (musl vs glibc) which can cause compatibility issues with some Python packages that have compiled C extensions. For production, `-slim` is the safer default.

### Step 2: Set a working directory

```dockerfile
WORKDIR /app
```

`WORKDIR` creates the directory if it doesn't exist and sets it as the working directory for all subsequent `RUN`, `COPY`, and `CMD` instructions. Using a named directory like `/app` is better than working in `/` — it keeps your files organized and avoids accidentally overwriting system files.

### Step 3: Install dependencies before copying code

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

**This is the most important build optimization pattern in Docker.**

Docker caches each layer. If you change `app.py` but not `requirements.txt`, Docker reuses the cached pip install layer and skips reinstalling packages. If you copied all files first (`COPY . .`), any change to any file — even a comment — would invalidate the cache and force a full reinstall.

The `--no-cache-dir` flag tells pip not to save downloaded packages to its cache directory, which keeps the image smaller.

### Step 4: Copy application code

```dockerfile
COPY app.py .
```

We only copy `app.py` because that's the only application file. If you had a `src/` directory, you'd `COPY src/ ./src/`.

### Step 5: Expose the port

```dockerfile
EXPOSE 5000
```

This is documentation, not enforcement. It tells Docker (and anyone reading the Dockerfile) that the app listens on port 5000. You still need `-p 5000:5000` in `docker run` to actually bind it to your machine.

### Step 6: Set the startup command

```dockerfile
CMD ["python", "app.py"]
```

**Always use the JSON array form (`["python", "app.py"]`) not the string form (`python app.py`).**

The string form runs through a shell (`/bin/sh -c`), which means your process is a child of the shell. When Docker sends a stop signal, it goes to the shell, not your app — graceful shutdown breaks. The JSON form runs your process directly as PID 1, receiving signals correctly.

---

## Running It

```bash
# Build
docker build -t devops-app:01 .

# Run in foreground
docker run -p 5000:5000 devops-app:01

# Run in background
docker run -d -p 5000:5000 --name devops-app devops-app:01

# Verify
curl http://localhost:5000/health
# {"status": "healthy"}

# Logs
docker logs devops-app

# Cleanup
docker stop devops-app && docker rm devops-app
```

---

## Production Tips

1. **Pin your base image version.** `FROM python:3.11-slim` is good. `FROM python:latest` will break your build when a new major version is released.

2. **Add a `.dockerignore` file.** Without it, `COPY . .` copies everything including `.git/`, `__pycache__/`, local `.env` files, and test artifacts into your image. Create a `.dockerignore` with at minimum:
   ```
   .git
   __pycache__
   *.pyc
   .env
   .venv
   ```

3. **Don't run as root.** By default, containers run as root inside the container. Add this before `CMD`:
   ```dockerfile
   RUN useradd -m appuser
   USER appuser
   ```
   This is covered in the production hardening exercise.

4. **Use specific tags, not `latest`.** `FROM python:3.11-slim` is better than `FROM python:3-slim` because it won't unexpectedly upgrade when 3.12 is released.
