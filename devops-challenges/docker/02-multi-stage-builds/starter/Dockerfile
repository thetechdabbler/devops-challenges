# TODO: This single-stage Dockerfile produces a ~900MB image because it uses the full
# Python image and includes build tools in the final artifact.
# Rewrite it as a multi-stage build to get the final image under 200MB.
#
# Hint:
#   Stage 1 (builder): Use python:3.11 to install deps and build wheels
#     RUN pip wheel --no-cache-dir -r requirements.txt -w /wheels
#   Stage 2 (runtime): Use python:3.11-slim, copy wheels from stage 1, install them
#     COPY --from=builder /wheels /wheels
#     RUN pip install --no-cache-dir --find-links=/wheels -r requirements.txt

FROM python:3.11

RUN apt-get update && \
    apt-get install -y build-essential gcc curl wget

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
