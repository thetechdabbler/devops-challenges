import os
import time
from flask import Flask, jsonify

app = Flask(__name__)

# TODO: This is a security problem — never hardcode credentials in source code.
# Move ALL of the values below to environment variables.
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "admin"
DB_PASS = "super_secret_password_123"   # <-- hardcoded secret, fix this!
DB_NAME = "myapp"

APP_ENV = "development"
APP_PORT = 5000


def read_secret(name, fallback=None):
    """
    TODO: Implement this function.
    It should try to read /run/secrets/<name> first (Docker secret).
    If that file doesn't exist, fall back to os.getenv(name.upper(), fallback).
    """
    return fallback


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
    """Return non-sensitive config so you can verify env vars are loaded."""
    return jsonify({
        "db_host": DB_HOST,
        "db_port": DB_PORT,
        "db_user": DB_USER,
        "db_name": DB_NAME,
        "app_env": APP_ENV,
        # Do NOT return DB_PASS here
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
