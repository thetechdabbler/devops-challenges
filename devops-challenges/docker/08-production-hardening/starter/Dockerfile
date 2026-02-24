FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

# TODO: Add a non-root user and switch to it before CMD.
# Steps:
# 1. Create a group and user: groupadd -r appuser && useradd -r -g appuser appuser
# 2. Change ownership of /app: chown -R appuser:appuser /app
# 3. Switch to the new user: USER appuser

CMD ["python", "app.py"]
