#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose=(docker compose --project-directory "$repo_root" -f "$repo_root/docker-compose.yml")

if (( $# != 1 )); then
  printf 'Usage: %s archive-path\n' "$0" >&2
  exit 2
fi

archive_path="$1"
if [[ "$archive_path" != /* ]]; then
  archive_path="$PWD/$archive_path"
fi
if [[ ! -f "$archive_path" ]]; then
  printf 'Archive not found: %s\n' "$archive_path" >&2
  exit 1
fi

if ! tar -tzf "$archive_path" >/dev/null; then
  printf 'Invalid archive: %s\n' "$archive_path" >&2
  exit 1
fi

has_database_dump=false
while IFS= read -r entry; do
  case "$entry" in
    database.dump)
      has_database_dump=true
      ;;
    media|media/*)
      ;;
    *)
      printf 'Unexpected archive entry: %s\n' "$entry" >&2
      exit 1
      ;;
  esac
  if [[ "$entry" == *'/../'* || "$entry" == ../* || "$entry" == *'/..' ]]; then
    printf 'Unsafe archive path: %s\n' "$entry" >&2
    exit 1
  fi
done < <(tar -tzf "$archive_path")

if [[ "$has_database_dump" != true ]]; then
  printf 'Archive does not contain database.dump\n' >&2
  exit 1
fi

running_services="$("${compose[@]}" ps --services --status running)"
if grep -Fxq app <<< "$running_services"; then
  printf 'Stop the app service before importing: docker compose stop app\n' >&2
  exit 1
fi

if [[ -d "$repo_root/media" ]] && [[ -n "$(find "$repo_root/media" -mindepth 1 -print -quit)" ]]; then
  printf 'Refusing to import over non-empty media directory: %s/media\n' "$repo_root" >&2
  exit 1
fi

table_count="$(
  "${compose[@]}" exec -T postgres sh -ec '
    psql --username="$POSTGRES_USER" \
      --dbname="$POSTGRES_DB" \
      --tuples-only \
      --no-align \
      --command "$1"
  ' sh "SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname <> 'pg_catalog' AND schemaname <> 'information_schema';"
)"
if [[ "$table_count" != 0 ]]; then
  printf 'Refusing to import into a database with existing tables (%s).\n' "$table_count" >&2
  printf 'Use an empty database; this command never drops existing database objects.\n' >&2
  exit 1
fi

temp_dir="$(mktemp -d)"
trap 'rm -rf -- "$temp_dir"' EXIT
tar -xzf "$archive_path" -C "$temp_dir"

if [[ ! -f "$temp_dir/database.dump" || ! -d "$temp_dir/media" ]]; then
  printf 'Archive must contain database.dump and media/ entries\n' >&2
  exit 1
fi

"${compose[@]}" exec -T postgres sh -ec 'pg_restore --list' \
  < "$temp_dir/database.dump" >/dev/null

"${compose[@]}" exec -T postgres sh -ec \
  'pg_restore --exit-on-error --single-transaction --no-owner --no-acl --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  < "$temp_dir/database.dump"

mkdir -p "$repo_root/media"
cp -a "$temp_dir/media/." "$repo_root/media/"
printf 'Database and uploads imported. Start the app with: docker compose up -d app\n'
