#!/usr/bin/env bash
# Create host folders with least privilege.
# Writable by containers only where required:
#   - media (Payload uploads) → UID 10001
#   - whisper-models / whisper-workdir (cache + tmp) → UID 10001
#   - postgres data → mode 700 (image entrypoint chowns on first boot)
# Does not delete existing data.
set -euo pipefail

DATA_DIR="${UV_DATA_DIR:-./data}"
MEDIA_DIR="${UV_MEDIA_DIR:-./media}"
APP_UID="${APP_UID:-10001}"
APP_GID="${APP_GID:-10001}"

mkdir -p \
  "${DATA_DIR}/postgres" \
  "${DATA_DIR}/whisper-models" \
  "${DATA_DIR}/whisper-workdir" \
  "${MEDIA_DIR}" \
  "${MEDIA_DIR}/podcast-audio"

# Postgres cluster dir: owner-only until the official entrypoint adjusts it.
chmod 700 "${DATA_DIR}/postgres" 2>/dev/null || true

own_writable() {
  local path="$1"
  local mode="${2:-700}"
  if chown -R "${APP_UID}:${APP_GID}" "$path" 2>/dev/null; then
    chmod -R "u+rwX,g-rwx,o-rwx" "$path" 2>/dev/null || true
    find "$path" -type d -exec chmod "$mode" {} + 2>/dev/null || chmod "$mode" "$path"
    return 0
  fi
  # Local Docker without sudo: grant only UID APP_UID via ACL when available.
  if command -v setfacl >/dev/null 2>&1; then
    setfacl -R -m "u:${APP_UID}:rwx" -m "d:u:${APP_UID}:rwx" "$path" 2>/dev/null || true
    chmod -R "u+rwX,g+rX,o-rwx" "$path" 2>/dev/null || true
    echo "note: ACL u:${APP_UID}:rwx on ${path} (chown unavailable)" >&2
    return 0
  fi
  # Last resort for local dev only — sticky world-writable like /tmp (not for production VPS).
  chmod -R a+rwX "$path" 2>/dev/null || true
  echo "warning: ${path} is world-writable (install ACL or run prepare as root)" >&2
}

own_writable "${MEDIA_DIR}" 700
own_writable "${DATA_DIR}/whisper-models" 700
own_writable "${DATA_DIR}/whisper-workdir" 700

echo "writable host paths (UID ${APP_UID}):"
echo "  media:            ${MEDIA_DIR}"
echo "  whisper-models:   ${DATA_DIR}/whisper-models"
echo "  whisper-workdir:  ${DATA_DIR}/whisper-workdir (tmp)"
echo "postgres data (700): ${DATA_DIR}/postgres"
