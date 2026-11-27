#!/usr/bin/env bash
# Export Postgres + Payload uploads into a single tar.gz (database.dump + media/).
# Reads media from ${UV_MEDIA_DIR:-./media}.
set -Eeuo pipefail
umask 077

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose=(docker compose --project-directory "$repo_root" -f "$repo_root/docker-compose.yml")

media_dir="${UV_MEDIA_DIR:-./media}"
if [[ "$media_dir" != /* ]]; then
  media_dir="$repo_root/${media_dir#./}"
fi

if (( $# > 1 )); then
  printf 'Usage: %s [archive-path]\n' "$0" >&2
  exit 2
fi

if (( $# == 1 )); then
  archive_path="$1"
  if [[ "$archive_path" != /* ]]; then
    archive_path="$repo_root/$archive_path"
  fi
else
  archive_path="$repo_root/backups/unlocked-ventures-$(date +%Y%m%d-%H%M%S).tar.gz"
fi

if [[ -e "$archive_path" ]]; then
  printf 'Refusing to overwrite existing archive: %s\n' "$archive_path" >&2
  exit 1
fi

if ! "${compose[@]}" ps --services --status running 2>/dev/null | grep -Fxq db; then
  printf 'Start Postgres first: docker compose up -d db\n' >&2
  exit 1
fi

mkdir -p "$(dirname -- "$archive_path")"
temp_dir="$(mktemp -d)"
trap 'rm -rf -- "$temp_dir"' EXIT

"${compose[@]}" exec -T db sh -ec \
  'pg_dump --format=custom --no-owner --no-acl --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  > "$temp_dir/database.dump"

mkdir "$temp_dir/media"
if [[ -d "$media_dir" ]]; then
  cp -a "$media_dir/." "$temp_dir/media/"
fi

tar -czf "$archive_path" -C "$temp_dir" database.dump media
printf 'Export created: %s\n' "$archive_path"
printf 'The archive includes the full database and uploads; transfer it securely.\n'
