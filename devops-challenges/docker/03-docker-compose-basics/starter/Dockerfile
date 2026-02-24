# Copy app.py and requirements.txt from shared-resources/app/ before building:
#   cp ../../../../shared-resources/app/app.py .
#   cp ../../../../shared-resources/app/requirements.txt .

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
