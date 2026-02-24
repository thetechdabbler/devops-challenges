import os
import time
from flask import Flask, jsonify

app = Flask(__name__)

# TODO: These connection strings use localhost — this is wrong for Docker networking.
# Containers have separate network namespaces; localhost refers to the container itself.
# Replace localhost with the Docker Compose service name for each service.
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/myapp")


@app.route("/")
def index():
    return jsonify({"message": "Hello from DevOps Teacher!", "version": "1.0.0"})


@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/ready")
def ready():
    return jsonify({"status": "ready"}), 200


@app.route("/cache-check")
def cache_check():
    """Try to reach Redis."""
    try:
        import redis as redis_lib
        r = redis_lib.from_url(REDIS_URL, socket_connect_timeout=2)
        r.ping()
        return jsonify({"redis": "reachable", "url": REDIS_URL})
    except Exception as e:
        return jsonify({"redis": "unreachable", "error": str(e)}), 500


@app.route("/db-check")
def db_check():
    """Try to reach Postgres."""
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL, connect_timeout=2)
        conn.close()
        return jsonify({"postgres": "reachable", "url": DATABASE_URL})
    except Exception as e:
        return jsonify({"postgres": "unreachable", "error": str(e)}), 500


@app.route("/info")
def info():
    return jsonify({
        "app": "devops-teacher-sample",
        "redis_url": REDIS_URL,
        "database_url": DATABASE_URL,
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
    app.run(host="0.0.0.0", port=5000)
