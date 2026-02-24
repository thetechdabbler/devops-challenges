# Resources — Optimize Image Size

## Size Audit Commands

```bash
# See image size
docker image ls <image>

# See layer sizes and commands
docker history <image>

# Interactive layer explorer (install separately)
# https://github.com/wagoodman/dive
dive <image>
```

## The Optimization Checklist

| Issue | Fix |
|-------|-----|
| Wrong base image | Use `python:3.11-slim` instead of `ubuntu` + Python |
| Unnecessary packages | Remove `vim`, `git`, `wget` — not needed at runtime |
| Split `apt-get update` / `install` | Chain them with `&&` in one `RUN` |
| No apt cache cleanup | Add `&& rm -rf /var/lib/apt/lists/*` at the end |
| No `--no-install-recommends` | Add to `apt-get install` |
| `pip` cache in layer | Add `--no-cache-dir` to `pip install` |
| Copying unnecessary files | Create `.dockerignore` |

## .dockerignore Template

```
.git
.gitignore
__pycache__
*.pyc
*.pyo
.env
.env.*
!.env.example
.venv
venv/
*.egg-info
dist/
build/
.pytest_cache/
.coverage
htmlcov/
```

## Official Docs

- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [.dockerignore file](https://docs.docker.com/engine/reference/builder/#dockerignore-file)
- [Python Docker official image](https://hub.docker.com/_/python)
