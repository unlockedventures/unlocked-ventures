# syntax=docker/dockerfile:1.7
# Kokoro TTS: pin tested CPU image, then harden.
# Upstream entrypoint used #!/bin/bash — replace with /bin/sh so bash can be removed.
# Final: USER 1000:1000, nologin, no interactive bash/apt clients.

FROM ghcr.io/remsky/kokoro-fastapi-cpu:v0.9.0

USER root
WORKDIR /app
RUN set -eu; \
  if getent passwd 1000 >/dev/null; then \
    usermod -s /usr/sbin/nologin "$(getent passwd 1000 | cut -d: -f1)" || true; \
  fi; \
  printf '%s\n' \
    '#!/bin/sh' \
    'set -e' \
    'if [ "${DOWNLOAD_MODEL:-true}" = "true" ]; then' \
    '  python download_model.py --output api/src/models/v1_0' \
    'fi' \
    'exec python -m uvicorn api.src.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8880}" --log-level debug' \
    > /app/entrypoint.sh \
  && chmod 0755 /app/entrypoint.sh \
  && rm -f /bin/bash /usr/bin/bash /usr/bin/apt /usr/bin/apt-get /usr/bin/dpkg 2>/dev/null || true \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt 2>/dev/null || true

USER 1000:1000
EXPOSE 8880
HEALTHCHECK --interval=10s --timeout=5s --retries=30 --start-period=90s \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8880/health')"]
CMD ["./entrypoint.sh"]
