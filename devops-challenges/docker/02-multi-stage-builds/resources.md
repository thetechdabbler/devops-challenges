# Resources — Multi-Stage Builds

## Core Concepts

### Layer model recap

Every `RUN`, `COPY`, and `ADD` instruction adds a layer to the image. Layers are immutable and stacked. The total image size is the sum of all layers. Once a layer is created, its contents cannot be removed by a later layer — you can only add more layers on top.

This is why `RUN apt-get install gcc` followed by `RUN apt-get remove gcc` does NOT make the image smaller. The install layer still exists underneath.

### Multi-stage solves this

Each `FROM` instruction starts a completely new layer stack. `COPY --from=<stage>` lets you pull specific files from a previous stage without carrying its layers.

### Python wheel files

A wheel (`.whl`) is a pre-compiled Python package. The `pip wheel` command compiles packages and stores them as wheel files — no compiler needed to install a wheel. This lets stage 1 do the hard work and stage 2 just installs the output.

```dockerfile
# Stage 1: compile
FROM python:3.11 AS builder
RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels

# Stage 2: runtime (no compiler needed)
FROM python:3.11-slim
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt
```

## Useful Commands

```bash
# Check image size
docker image ls <image>

# See all layers and their sizes
docker history <image>

# Detailed layer info (install dive for interactive inspection)
# https://github.com/wagoodman/dive
dive <image>
```

## Official Docs

- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [dive — layer inspector](https://github.com/wagoodman/dive)
