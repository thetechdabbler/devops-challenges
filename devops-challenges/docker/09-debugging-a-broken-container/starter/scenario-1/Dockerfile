FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

# BUG: This CMD is wrong. Can you spot it?
# Hint: run `docker run --rm <image>` and read the output carefully.
CMD ["python", "app.py", "--serve"]
