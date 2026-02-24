# Solution — Optimize Image Size

## The Optimized Files

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

**.dockerignore:**
```
.git
__pycache__
*.pyc
.env
.venv
*.egg-info
```

---

## Fixes Applied

### Fix 1: Base image

```dockerfile
# Before
FROM ubuntu:22.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip build-essential gcc curl wget vim git

# After
FROM python:3.11-slim
```

`ubuntu:22.04` + Python installation = ~500MB. `python:3.11-slim` = ~130MB. You get Python pre-installed in a Debian slim image with no extra packages. Saves ~370MB before you even add your app.

`python:3.11-slim` doesn't include build tools like `gcc`. For Flask (pure Python), you don't need them. If you had packages with C extensions, you'd use the multi-stage pattern from exercise 02.

### Fix 2: No unnecessary packages

The original installed `vim`, `git`, `wget`, `curl`, and `build-essential`. Ask yourself for each package: *does the running application need this?*

- `vim` — editing files inside a container is an anti-pattern; use `docker exec` + your host editor
- `git` — you clone code before building the image, not inside it
- `wget`/`curl` — only needed if your app uses them at runtime; the sample app doesn't
- `build-essential`/`gcc` — only needed to compile C extensions

### Fix 3: Chain RUN commands and clean apt cache

```dockerfile
# Before (2 layers, cache not cleaned)
RUN apt-get update
RUN apt-get install -y python3 python3-pip

# After (1 layer, clean cache in same step)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*
```

Since we switched to `python:3.11-slim`, we skip apt entirely. But the pattern above applies any time you need apt.

### Fix 4: pip --no-cache-dir

```dockerfile
# Before
RUN pip3 install -r requirements.txt

# After
RUN pip install --no-cache-dir -r requirements.txt
```

Saves ~50MB of pip download cache that was being stored inside the layer for no benefit.

### Fix 5: .dockerignore

Without `.dockerignore`, `COPY . .` copies `.git/` (your full git history) into the image. A typical project's `.git/` is 10–100MB. It also copies `__pycache__/`, `.env` files, and test artifacts.

The `.dockerignore` syntax is identical to `.gitignore`.

---

## Size Comparison

| Image | Size |
|-------|------|
| `devops-app:fat` (original) | ~920MB |
| `devops-app:lean` (optimized) | ~130MB |

---

## Production Tip: Use dive to find hidden size

[dive](https://github.com/wagoodman/dive) is a terminal UI that shows you exactly which files each layer adds or removes. Run `dive devops-app:fat` to visually identify what's consuming space before you start optimizing.

```bash
# Install on macOS
brew install dive

# Inspect an image
dive devops-app:fat
```
