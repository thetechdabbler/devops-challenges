"""
DevOps Sample App
-----------------
A minimal Flask web application used across all DevOps challenge topics.
Containerize it, deploy it, monitor it, build pipelines around it.
"""

import os
import time
import logging
from flask import Flask, jsonify

# Structured JSON logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

START_TIME = time.time()


@app.route("/")
def index():
    logger.info("GET /")
    return jsonify({
        "app": "devops-sample-app",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("APP_ENV", "development"),
        "message": "Hello from the DevOps Sample App!"
    })


@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/ready")
def ready():
    # Simulate a readiness check (e.g. DB connection, config loaded)
    return jsonify({"status": "ready"}), 200


@app.route("/info")
def info():
    uptime = round(time.time() - START_TIME, 2)
    return jsonify({
        "app": "devops-sample-app",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("APP_ENV", "development"),
        "uptime_seconds": uptime,
        "port": int(os.getenv("PORT", 5000))
    })


@app.route("/simulate/error")
def simulate_error():
    """Useful for testing alerting and error rate dashboards."""
    logger.error("Simulated error triggered")
    return jsonify({"error": "simulated internal error"}), 500


@app.route("/simulate/slow")
def simulate_slow():
    """Useful for testing latency alerts and tracing."""
    delay = float(os.getenv("SLOW_DELAY", 2.0))
    time.sleep(delay)
    return jsonify({"message": f"responded after {delay}s delay"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting devops-sample-app on port {port}")
    app.run(host="0.0.0.0", port=port)
