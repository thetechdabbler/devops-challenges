import os
import time
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return jsonify({"message": "Hello from DevOps Teacher!", "version": "1.0.0"})


@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/simulate/slow")
def simulate_slow():
    delay = float(os.getenv("SLOW_DELAY", 2.0))
    time.sleep(delay)
    return jsonify({"message": f"responded after {delay}s delay"})


if __name__ == "__main__":
    # BUG: The app binds to 127.0.0.1 (loopback only).
    # Inside the container this means it's only reachable from within the container itself.
    # Port mapping (-p 5000:5000) forwards host traffic to the container, but the app
    # isn't listening on the container's eth0 interface.
    # Hint: run `docker exec -it <container> ss -tlnp` and look at the bind address.
    app.run(host="127.0.0.1", port=5000)
