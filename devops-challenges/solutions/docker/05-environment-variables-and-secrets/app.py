import os
import time
from flask import Flask, jsonify

app = Flask(__name__)


def read_secret(name, fallback=None):
    """Read a Docker secret file, falling back to an env var."""
    path = f"/run/secrets/{name}"
    try:
        with open(path) as f:
            return f.read().strip()
    except FileNotFoundError:
        return os.getenv(name.upper(), fallback)


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = read_secret("db_password", fallback="changeme")
DB_NAME = os.getenv("DB_NAME", "myapp")

APP_ENV = os.getenv("APP_ENV", "development")
APP_PORT = int(os.getenv("APP_PORT", 5000))


@app.route("/")
def index():
    return jsonify({"message": "Hello from DevOps Teacher!", "version": "1.0.0"})


@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/ready")
def ready():
    return jsonify({"status": "ready"}), 200


@app.route("/config")
def config():
    return jsonify({
        "db_host": DB_HOST,
        "db_port": DB_PORT,
        "db_user": DB_USER,
        "db_name": DB_NAME,
        "app_env": APP_ENV,
    })


@app.route("/info")
def info():
    return jsonify({
        "app": "devops-teacher-sample",
        "environment": APP_ENV,
    })


@app.route("/simulate/error")
def simulate_error():
    return jsonify({"error": "simulated internal error"}), 500


@app.route("/simulate/slow")
def simulate_slow():
    delay = float(os.getenv("SLOW_DELAY", 2.0))
    time.sleep(delay)
    return jsonify({"message": f"responded after {delay}s delay"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=APP_PORT, debug=(APP_ENV == "development"))
