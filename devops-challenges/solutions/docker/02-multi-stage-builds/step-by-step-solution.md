# Solution — Multi-Stage Builds

## The Completed Dockerfile

```dockerfile
# Stage 1: Build — compile dependencies into wheels
FROM python:3.11 AS builder

WORKDIR /build

COPY requirements.txt .
RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels


# Stage 2: Runtime — slim image, no compiler needed
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

## Step-by-Step Explanation

### Stage 1: builder

```dockerfile
FROM python:3.11 AS builder
```

We name this stage `builder`. The `AS builder` label lets us reference it in `COPY --from=builder` later. This stage uses the full `python:3.11` image because we need the compiler tools to build wheels.

```dockerfile
RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels
```

`pip wheel` compiles each package and writes `.whl` files to `/wheels`. These are pre-compiled binaries — no compiler needed to install them. This is the key insight: do the compilation work here, carry only the output.

### Stage 2: runtime

```dockerfile
FROM python:3.11-slim
```

A clean slate. This stage has zero knowledge of stage 1's filesystem except what we explicitly copy.

```dockerfile
COPY --from=builder /wheels /wheels
```

This is the bridge between stages. We copy only the `/wheels` directory from `builder` — not the compiler, not the build tools, not the build stage's OS packages. Nothing else crosses the boundary.

```dockerfile
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels
```

`--find-links=/wheels` tells pip to look in our local wheel directory before reaching out to PyPI. Since all our packages are already there as pre-built wheels, no compilation happens. Then we immediately remove `/wheels` — we don't need them anymore and they'd add size to this layer.

---

## Verifying the Result

```bash
docker build -t devops-app:optimized .
docker image ls | grep devops-app
```

Expected output:
```
devops-app   optimized   abc123   2 minutes ago   145MB
devops-app   bloated     def456   5 minutes ago   912MB
```

Check that gcc isn't in the final image:
```bash
docker run --rm devops-app:optimized which gcc
# returns nothing — gcc is not present
```

---

## Production Tips

**1. Name your stages.** `AS builder` makes the Dockerfile readable. You can also name the final stage:
```dockerfile
FROM python:3.11-slim AS runtime
```

**2. Target specific stages in CI.** The `--target` flag builds only up to a named stage:
```bash
docker build --target builder -t my-app:build-deps .
```
Useful for running tests in the builder stage without building the full final image.

**3. Cache the builder layer in CI.** The builder stage changes less often than the runtime code. With BuildKit and registry caching, CI can reuse the compiled wheels between runs even if the source code changed:
```bash
docker build --cache-from=myregistry/app:builder-cache ...
```

**4. Consider distroless for even smaller images.** Google's distroless images contain only the runtime and nothing else (no shell, no package manager). For Python: `gcr.io/distroless/python3`. Tradeoff: debugging is harder because you can't `docker exec` into a shell.
