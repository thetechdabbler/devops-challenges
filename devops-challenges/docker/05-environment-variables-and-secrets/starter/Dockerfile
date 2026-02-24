FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# TODO: Add a .dockerignore so .env files are not copied into the image
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
