# Resources — Debugging a Broken Container

## Core Debug Commands

```bash
# Container logs (most useful first stop)
docker logs <container>
docker logs --tail 50 --follow <container>

# Exit code
docker inspect <container> --format='{{.State.ExitCode}}'
docker inspect <container> --format='{{.State.Error}}'

# Shell into a running container
docker exec -it <container> /bin/sh

# Run image with shell instead of CMD
docker run --rm -it --entrypoint /bin/sh <image>

# Image layer history
docker history <image>
docker history --no-trunc <image>   # show full commands

# Resource usage
docker stats <container>

# Inspect full container config
docker inspect <container>
docker inspect <container> | jq '.[0].State'
docker inspect <container> | jq '.[0].HostConfig'

# Check what files are in the image
docker run --rm <image> find /app -type f
docker run --rm <image> ls -la /app

# Check if a binary exists in the image
docker run --rm <image> which python3
docker run --rm <image> python3 --version
```

## Common Exit Codes

| Code | Cause | Fix |
|------|-------|-----|
| 0 | CMD ran and exited normally | Use `-it` to keep container alive, or ensure CMD blocks |
| 1 | Application error | Check `docker logs` for traceback |
| 126 | Permission denied running CMD | Check file permissions |
| 127 | CMD binary not found | Check CMD spelling; verify package is installed |
| 137 | OOM kill or SIGKILL | Check `docker stats`; add memory limits |
| 143 | SIGTERM received | Normal graceful shutdown |

## Debugging Patterns

### Pattern: Container exits immediately
```bash
docker run --rm <image>              # watch stdout for errors
docker run --rm <image> cat /etc/os-release  # verify base image
docker run --rm -it --entrypoint sh <image>  # explore manually
```

### Pattern: App returns 500
```bash
docker logs <container>              # look for Python traceback
docker exec -it <container> python3 -c "import your_module"  # test imports
docker exec -it <container> env      # check env vars are set
```

### Pattern: Port not reachable
```bash
# Is the app listening on the right interface?
docker exec -it <container> ss -tlnp
# Should show: 0.0.0.0:5000, not 127.0.0.1:5000

# Is the port mapping correct?
docker inspect <container> --format='{{.NetworkSettings.Ports}}'
```

## Official Docs

- [docker logs](https://docs.docker.com/engine/reference/commandline/logs/)
- [docker exec](https://docs.docker.com/engine/reference/commandline/exec/)
- [docker inspect](https://docs.docker.com/engine/reference/commandline/inspect/)
