FROM python:3.11-slim-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/transcriber
COPY requirements.txt .
RUN pip install --no-cache-dir "setuptools==70.3.0" wheel \
  && pip install --no-cache-dir --no-build-isolation -r requirements.txt
COPY transcribe.py server.py ./

ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "server.py"]
