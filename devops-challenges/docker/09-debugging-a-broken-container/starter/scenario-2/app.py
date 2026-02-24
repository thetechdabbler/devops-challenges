import os
import time
from flask import Flask, jsonify

app = Flask(__name__)

# BUG: This will raise an exception at startup if the env var is not set.
# Hint: check `docker logs <container>` for a traceback.
REQUIRED_API_KEY = os.environ["API_KEY"]   # KeyError if not set!


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
    app.run(host="0.0.0.0", port=5000)
