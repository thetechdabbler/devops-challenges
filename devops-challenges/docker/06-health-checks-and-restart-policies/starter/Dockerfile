FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

# TODO: Add a HEALTHCHECK instruction here.
# It should probe GET /health every 30 seconds,
# wait 10 seconds before the first check (start-period),
# timeout after 5 seconds, and retry 3 times before marking unhealthy.
# Hint: python:3.11-slim includes curl.

CMD ["python", "app.py"]
