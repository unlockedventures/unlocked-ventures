# syntax=docker/dockerfile:1.7
# Whisper (Compose: whisper). Multi-stage, non-root APP_UID/APP_GID (default 10001),
# passwd shell = nologin, interactive shells + apt clients removed, exec-form entrypoint.
#
# Not Alpine/distroless: openai-whisper → torch needs glibc; ffmpeg + yt-dlp must exist
# as real binaries (subprocess). Surface minimized within that constraint.

ARG APP_UID=10001
ARG APP_GID=10001
ARG PYTHON_VERSION=3.11

FROM python:${PYTHON_VERSION}-slim-bookworm AS builder
WORKDIR /build
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
# setuptools must stay on the default path for openai-whisper's sdist build backend.
# Only the app deps go under --prefix=/install (copied to the runner as /usr/local).
RUN pip install --no-cache-dir "setuptools==70.3.0" wheel \
  && pip install --no-cache-dir --prefix=/install --no-build-isolation -r requirements.txt

FROM python:${PYTHON_VERSION}-slim-bookworm AS runner
ARG APP_UID=10001
ARG APP_GID=10001
WORKDIR /opt/transcriber

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates nodejs \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --gid "${APP_GID}" app \
  && useradd --uid "${APP_UID}" --gid app --create-home --home-dir /home/app \
    --shell /usr/sbin/nologin app \
  && mkdir -p /opt/transcriber /home/app/.cache/whisper /tmp/pipeline \
  && chown -R "${APP_UID}:${APP_GID}" /opt/transcriber /home/app /tmp/pipeline \
  # Drop package-manager clients and interactive shells (exec entrypoint needs no shell).
  && rm -f \
    /usr/bin/apt /usr/bin/apt-get /usr/bin/apt-cache /usr/bin/dpkg \
    /bin/bash /usr/bin/bash \
    /bin/sh /bin/dash /usr/bin/sh /usr/bin/dash \
    /bin/su /usr/bin/su /usr/bin/passwd \
  && rm -rf /var/lib/apt /var/cache/apt

COPY --from=builder /install /usr/local
COPY --chown=${APP_UID}:${APP_GID} transcribe.py server.py ./

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  HOME=/home/app \
  TMPDIR=/tmp/pipeline \
  WHISPER_MODEL=small \
  TRANSCRIBER_TIMEOUT_SECONDS=43200

USER ${APP_UID}:${APP_GID}
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=10 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health')"]

# Clear Debian/python image shell entrypoint; run the service directly.
ENTRYPOINT ["python", "server.py"]
