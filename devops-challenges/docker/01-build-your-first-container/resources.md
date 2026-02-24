# Resources — Build Your First Container

## Core Concepts

### Docker Image vs Container

- An **image** is a read-only template — the blueprint (like a class in OOP)
- A **container** is a running instance of that image (like an object)
- You build images once and run many containers from them

### The Image Build Process

When you run `docker build`, Docker reads your `Dockerfile` top to bottom and creates a **layer** for each instruction that modifies the filesystem (`RUN`, `COPY`, `ADD`). Layers are cached — if a layer hasn't changed, Docker reuses it from cache.

### Container Lifecycle

```
docker build  →  image exists
docker run    →  container starts (running)
docker stop   →  container stops (exited)
docker rm     →  container deleted
docker rmi    →  image deleted
```

## Essential Commands

```bash
# Build an image from a Dockerfile in the current directory
docker build -t my-image:tag .

# Run a container (foreground, remove when stopped)
docker run --rm -p 5000:5000 my-image:tag

# Run in background (detached)
docker run -d -p 5000:5000 --name my-container my-image:tag

# View running containers
docker ps

# View all containers including stopped
docker ps -a

# View logs
docker logs my-container

# Execute a command inside a running container
docker exec -it my-container bash

# Stop a container
docker stop my-container

# Remove a container
docker rm my-container

# List images
docker images

# Remove an image
docker rmi my-image:tag
```

## Official Documentation

- [Get started with Docker](https://docs.docker.com/get-started/)
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- [docker run reference](https://docs.docker.com/engine/reference/commandline/run/)
- [Docker best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
