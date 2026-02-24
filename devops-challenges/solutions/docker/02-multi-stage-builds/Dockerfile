# Stage 1: Build — compile dependencies into wheels
FROM python:3.11 AS builder

WORKDIR /build

COPY requirements.txt .
RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels


# Stage 2: Runtime — slim image, no compiler needed
FROM python:3.11-slim

WORKDIR /app

# Install pre-built wheels from the builder stage
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
