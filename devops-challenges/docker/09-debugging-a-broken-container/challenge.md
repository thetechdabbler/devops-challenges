# Challenge — Debugging a Broken Container

## Scenario

You've just inherited a containerized Flask app. It builds successfully but the container immediately exits, or it starts but returns 500 errors on every request. You have no idea why. The previous developer left no documentation.

This exercise teaches you the systematic Docker debugging workflow: reading logs, inspecting state, exec-ing into containers, and reading layer history.

---

## The Broken Containers

There are **three** separate broken images to debug, each with a different problem:

### Bug 1: Container exits immediately

Build and run `scenario-1/`. The container starts and immediately exits. Figure out why and fix it.

### Bug 2: App starts but returns 500 on every request

Build and run `scenario-2/`. The container stays up but `curl http://localhost:5000/health` returns HTTP 500 or a connection error. Figure out why and fix it.

### Bug 3: App works locally but not in Docker

Build and run `scenario-3/`. The app works when you run `python app.py` directly, but inside Docker it's unreachable. Figure out why and fix it.

---

## Debugging Toolkit

Use these commands to investigate each scenario:

```bash
# 1. Build and run
docker build -t debug-test .
docker run --rm -p 5000:5000 debug-test

# 2. Read the exit code
docker run --rm debug-test; echo "Exit code: $?"

# 3. Read logs from a stopped container
docker run --name debug-test -p 5000:5000 debug-test
docker logs debug-test

# 4. Run with a shell instead of the default CMD
docker run --rm -it --entrypoint /bin/sh debug-test

# 5. Exec into a running container
docker exec -it <container-id> /bin/sh

# 6. Inspect the image layers
docker history debug-test

# 7. Inspect container state
docker inspect <container-id>
```

---

## Tasks

For each scenario:
1. Use the debugging commands to identify the root cause
2. Write down what the bug is in your own words
3. Fix the Dockerfile or app.py
4. Rebuild and verify the fix

---

## Acceptance Criteria

- [ ] Scenario 1: Container runs without immediately exiting; `docker ps` shows it as `Up`
- [ ] Scenario 2: `curl http://localhost:5000/health` returns `{"status": "healthy"}` with HTTP 200
- [ ] Scenario 3: `curl http://localhost:5000/` returns a successful response
- [ ] You can explain the root cause of each bug in one sentence

---

## Learning Notes

### Debug workflow checklist

1. `docker logs <container>` — first stop for any problem
2. `docker inspect <container>` — check `State.ExitCode`, `State.Error`
3. `docker run -it --entrypoint /bin/sh <image>` — explore the image manually
4. `docker history <image>` — understand what each layer does
5. `docker stats <container>` — check CPU/memory if the app is slow

### Common exit codes

| Code | Meaning |
|------|---------|
| 0 | Clean exit (CMD returned normally) |
| 1 | Application error (check logs) |
| 125 | Docker daemon error |
| 126 | Permission denied |
| 127 | Command not found (CMD typo or missing binary) |
| 137 | SIGKILL — OOM killer or `docker kill` |
| 143 | SIGTERM — graceful shutdown |
