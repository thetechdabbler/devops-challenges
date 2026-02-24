# 01 — Build Your First Container

**Level**: Beginner | **Topic**: Docker

Containerize the sample Python web app using a `Dockerfile`. The goal is to build an image, run it, and confirm the app responds over HTTP.

## Quick Start

1. Copy the sample app into `starter/`:
   ```bash
   cp -r ../../../../shared-resources/app/* starter/
   ```
2. Write your `Dockerfile` in `starter/`
3. Build and run:
   ```bash
   cd starter
   docker build -t devops-app:01 .
   docker run -p 5000:5000 devops-app:01
   ```
4. Test: `curl http://localhost:5000/health`

See [`challenge.md`](./challenge.md) for full task details and acceptance criteria.

## Solution

[`solutions/docker/01-build-your-first-container/`](../../../solutions/docker/01-build-your-first-container/)
