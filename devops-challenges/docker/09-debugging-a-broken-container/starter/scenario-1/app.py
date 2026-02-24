import os
import sys
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
    # The app does not accept a --serve flag.
    # Flask's development server is started with app.run().
    app.run(host="0.0.0.0", port=5000)
