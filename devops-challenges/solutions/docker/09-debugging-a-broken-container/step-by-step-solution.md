# Solution — Debugging a Broken Container

## Scenario 1: Container exits immediately

**Root cause**: The `CMD` passes an unknown flag `--serve` to `python app.py`. Python's `app.py` doesn't accept this argument, so it prints an error and exits with code 1.

**How to find it**:
```bash
docker build -t debug-1 .
docker run --rm debug-1
# Output: unrecognized arguments: --serve
# Exit code: 2

docker run --rm debug-1; echo "Exit: $?"
```

**Fix**:
```dockerfile
# Before
CMD ["python", "app.py", "--serve"]

# After
CMD ["python", "app.py"]
```

---

## Scenario 2: App starts but returns 500

**Root cause**: `app.py` uses `os.environ["API_KEY"]` (square brackets) instead of `os.getenv("API_KEY")`. Square brackets raise `KeyError` if the variable is unset. The exception happens at import time, before Flask serves any request — the container runs but Python crashes immediately.

**How to find it**:
```bash
docker build -t debug-2 .
docker run -d --name debug-2 -p 5001:5000 debug-2
docker logs debug-2
# Output: KeyError: 'API_KEY'
```

**Fix**:
```python
# Before (crashes if env var missing)
REQUIRED_API_KEY = os.environ["API_KEY"]

# After (returns None if missing, or provide a fallback)
REQUIRED_API_KEY = os.getenv("API_KEY", "dev-key-not-set")
```

Alternatively, set the env var when running:
```bash
docker run -e API_KEY=mykey debug-2
```

---

## Scenario 3: App unreachable from host

**Root cause**: Flask binds to `127.0.0.1` (loopback). Inside the container, `127.0.0.1` refers to the container's own loopback interface — not the container's `eth0`. Port forwarding (`-p 5000:5000`) routes traffic from the host to the container's `eth0`, but Flask isn't listening there.

**How to find it**:
```bash
docker build -t debug-3 .
docker run -d --name debug-3 -p 5002:5000 debug-3
curl http://localhost:5002/     # connection refused

# Check what address Flask is bound to
docker exec debug-3 ss -tlnp
# Shows: 127.0.0.1:5000  ← only loopback, not 0.0.0.0
```

**Fix**:
```python
# Before
app.run(host="127.0.0.1", port=5000)

# After
app.run(host="0.0.0.0", port=5000)
```

`0.0.0.0` means "all interfaces" — Flask listens on loopback AND eth0, making it reachable via port forwarding.

---

## Summary

| Scenario | Bug | Debug command | Fix |
|----------|-----|---------------|-----|
| 1 | Unknown CMD argument | `docker run --rm <image>` | Remove `--serve` flag |
| 2 | `os.environ[]` raises KeyError | `docker logs <container>` | Use `os.getenv()` with fallback |
| 3 | Flask binds to 127.0.0.1 | `docker exec <container> ss -tlnp` | Bind to `0.0.0.0` |
