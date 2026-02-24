# Challenge 01 — Build Your First Container

**Topic**: Docker | **Level**: Beginner

---

## Challenge Statement

Your team has a Python web application that currently runs directly on developer laptops with `python app.py`. Every new team member spends hours getting the right Python version, installing dependencies, and debugging environment differences. The classic "works on my machine" problem.

Your task is to containerize this application so it runs identically everywhere — on any developer's machine, in CI, and in production.

---

## Goal

Write a `Dockerfile` that builds a working Docker image of the sample app. The container must start the app, expose it on port 5000, and respond to HTTP requests.

---

## Prerequisites

- Docker Desktop installed and running
- Basic terminal familiarity (cd, ls, file editing)
- The sample app in `shared-resources/app/`

---

## Tasks

1. Copy the sample app from `shared-resources/app/` into the `starter/` directory of this exercise (do not modify the original).

2. Write a `Dockerfile` in `starter/` that:
   - Uses an official Python base image
   - Sets a working directory inside the container
   - Copies `requirements.txt` and installs dependencies
   - Copies the application source code
   - Exposes port 5000
   - Defines the command to start the app

3. Build the image:
   ```bash
   docker build -t devops-app:01 .
   ```

4. Run a container from your image:
   ```bash
   docker run -p 5000:5000 devops-app:01
   ```

5. Verify the app responds:
   ```bash
   curl http://localhost:5000/health
   # Expected: {"status": "healthy"}
   ```

6. Stop the container and run it in detached mode:
   ```bash
   docker run -d -p 5000:5000 --name devops-app devops-app:01
   ```

7. View the container logs:
   ```bash
   docker logs devops-app
   ```

8. Stop and remove the container:
   ```bash
   docker stop devops-app && docker rm devops-app
   ```

---

## Acceptance Criteria

- [ ] A valid `Dockerfile` exists in `starter/`
- [ ] `docker build -t devops-app:01 .` completes without errors
- [ ] `docker run -p 5000:5000 devops-app:01` starts the container
- [ ] `curl http://localhost:5000/health` returns `{"status": "healthy"}`
- [ ] `curl http://localhost:5000/` returns a JSON response with `"app": "devops-sample-app"`
- [ ] Container runs successfully in detached mode with `--name devops-app`
- [ ] `docker logs devops-app` shows application startup log output

---

## Learning Notes

### What is a container?

A container is a lightweight, isolated process that packages your application and all its dependencies together. Unlike a virtual machine, it shares the host OS kernel but has its own filesystem, network, and process space.

### Dockerfile instructions used here

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Sets the base image — the starting point for your image |
| `WORKDIR` | Sets the working directory inside the container |
| `COPY` | Copies files from your machine into the image |
| `RUN` | Executes a command during the image build |
| `EXPOSE` | Documents which port the app listens on (informational) |
| `CMD` | Defines the default command to run when the container starts |

### Why copy `requirements.txt` before the rest of the code?

Docker builds images in layers. If you copy `requirements.txt` separately and install dependencies before copying the rest of the code, Docker caches the dependency layer. When you change only your app code, Docker reuses the cached layer and doesn't reinstall all dependencies — much faster builds.

### The difference between `EXPOSE` and `-p`

`EXPOSE` in the Dockerfile just documents that the container listens on a port. It does not publish the port to the host. The `-p 5000:5000` flag in `docker run` is what actually maps the container port to a port on your machine.

---

## Resources

- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- [docker build](https://docs.docker.com/engine/reference/commandline/build/)
- [docker run](https://docs.docker.com/engine/reference/commandline/run/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
