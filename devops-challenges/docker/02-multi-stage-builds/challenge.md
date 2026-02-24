# Challenge 02 — Multi-Stage Builds

**Topic**: Docker | **Level**: Beginner

---

## Challenge Statement

Your CI pipeline is taking 12 minutes per run. Profiling shows 8 of those minutes are spent pushing and pulling a 900MB Docker image. The image is that large because the single-stage Dockerfile uses `python:3.11` (the full image) and installs `build-essential` and `gcc` — tools only needed to compile dependencies, not to run the app.

In production, you never need a compiler. You only need the compiled output.

---

## Goal

Rewrite the provided `starter/Dockerfile` as a multi-stage build. The first stage compiles and packages dependencies into wheel files. The second stage is a slim runtime image that installs from those pre-built wheels. The final image must be **under 200MB** and the app must still respond correctly.

---

## Prerequisites

- Docker Desktop running
- Completed exercise 01 (understand basic Dockerfile instructions)
- The sample app from `shared-resources/app/` copied into `starter/`

---

## Tasks

1. Copy the sample app into `starter/`:
   ```bash
   cp ../../../../shared-resources/app/app.py starter/
   cp ../../../../shared-resources/app/requirements.txt starter/
   ```

2. Check the current image size:
   ```bash
   cd starter
   docker build -t devops-app:bloated .
   docker image ls devops-app:bloated
   ```
   Note the size — it should be around 900MB.

3. Rewrite `starter/Dockerfile` as a two-stage build:
   - **Stage 1** (`builder`): Use `python:3.11`, install build tools, build wheel files from `requirements.txt`
   - **Stage 2** (`runtime`): Use `python:3.11-slim`, copy wheels from stage 1, install them, copy app code

4. Build the optimized image:
   ```bash
   docker build -t devops-app:optimized .
   docker image ls devops-app:optimized
   ```

5. Verify the app still works:
   ```bash
   docker run -p 5000:5000 devops-app:optimized
   curl http://localhost:5000/health
   ```

6. Compare the two image sizes side by side:
   ```bash
   docker image ls devops-app
   ```

7. Inspect the layers of both images:
   ```bash
   docker history devops-app:bloated
   docker history devops-app:optimized
   ```

---

## Acceptance Criteria

- [ ] `starter/Dockerfile` uses at least two `FROM` instructions
- [ ] The optimized image is under 200MB (`docker image ls` confirms)
- [ ] `curl http://localhost:5000/health` returns `{"status": "healthy"}`
- [ ] `docker history devops-app:optimized` shows no build tools (`gcc`, `build-essential`) in the final layers
- [ ] The runtime stage uses `python:3.11-slim` as its base

---

## Learning Notes

### What is a multi-stage build?

A multi-stage build uses multiple `FROM` instructions in a single Dockerfile. Each `FROM` starts a new stage with a clean filesystem. You can copy specific files from earlier stages using `COPY --from=<stage>`.

Only the **last stage** becomes the final image. All intermediate stages are discarded.

### The pattern

```
Stage 1 (builder): Full image + build tools → produces compiled artifacts
Stage 2 (runtime): Slim image → copies only the artifacts, discards the tools
```

### Why this matters

Build tools (`gcc`, `make`, `build-essential`) are needed to compile C extensions in Python packages like `cryptography` or `psutil`. But once compiled, you never need the compiler again. Without multi-stage builds, these tools stay in the final image — adding hundreds of MB and increasing the attack surface.

### COPY --from

```dockerfile
COPY --from=builder /wheels /wheels
```

This copies the `/wheels` directory from the stage named `builder` into the current stage. You can reference stages by name (`AS builder`) or by index (`--from=0`).

### When NOT to use multi-stage

For pure interpreted languages with no native extensions (simple Python scripts, Node.js), multi-stage is less critical — a `.dockerignore` and a slim base image often gets you far enough. Multi-stage shines when compilation is involved.

---

## Resources

- [Multi-stage builds — Docker docs](https://docs.docker.com/build/building/multi-stage/)
- [docker image ls](https://docs.docker.com/engine/reference/commandline/image_ls/)
- [docker history](https://docs.docker.com/engine/reference/commandline/history/)
