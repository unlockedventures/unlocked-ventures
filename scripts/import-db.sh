#!/usr/bin/env bash
# Restore database.dump + media/ from a project archive into the Compose stack.
# Media lands under ${UV_MEDIA_DIR:-./media} (Payload + Compose bind mount).
set -Eeuo pipefail
umask 077

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
compose=(docker compose --project-directory "$repo_root" -f "$repo_root/docker-compose.yml")

data_root="${UV_DATA_DIR:-./data}"
if [[ "$data_root" != /* ]]; then
  data_root="$repo_root/${data_root#./}"
fi

media_dir="${UV_MEDIA_DIR:-./media}"
if [[ "$media_dir" != /* ]]; then
  media_dir="$repo_root/${media_dir#./}"
fi

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

running_services="$("${compose[@]}" ps --services --status running 2>/dev/null || true)"
if grep -Fxq app <<< "$running_services"; then
  printf 'Stop the app service before importing: docker compose stop app\n' >&2
  exit 1
fi

if ! "${compose[@]}" ps --services --status running 2>/dev/null | grep -Fxq db; then
  printf 'Start Postgres first: docker compose up -d db\n' >&2
  exit 1
fi

if [[ -d "$media_dir" ]] && [[ -n "$(find "$media_dir" -mindepth 1 -print -quit 2>/dev/null || true)" ]]; then
  printf 'Refusing to import over non-empty media directory: %s\n' "$media_dir" >&2
  printf 'Move/empty it first, or set UV_MEDIA_DIR to a fresh directory.\n' >&2
  exit 1
fi

table_count="$(
  "${compose[@]}" exec -T db sh -ec '
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
  printf 'Fresh wipe example (DESTROYS local DB files):\n' >&2
  printf '  docker compose down\n' >&2
  printf '  rm -rf %s/postgres\n' "$data_root" >&2
  printf '  bash .github/scripts/prepare-data-dirs.sh && docker compose up -d db\n' >&2
  exit 1
fi

temp_dir="$(mktemp -d)"
trap 'rm -rf -- "$temp_dir"' EXIT
tar -xzf "$archive_path" -C "$temp_dir"

if [[ ! -f "$temp_dir/database.dump" || ! -d "$temp_dir/media" ]]; then
  printf 'Archive must contain database.dump and media/ entries\n' >&2
  exit 1
fi

"${compose[@]}" exec -T db sh -ec 'pg_restore --list' \
  < "$temp_dir/database.dump" >/dev/null

"${compose[@]}" exec -T db sh -ec \
  'pg_restore --exit-on-error --single-transaction --no-owner --no-acl --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  < "$temp_dir/database.dump"

mkdir -p "$media_dir"
cp -a "$temp_dir/media/." "$media_dir/"
# Match prepare-data-dirs: writable by app UID 10001 only when possible.
if chown -R 10001:10001 "$media_dir" 2>/dev/null; then
  chmod -R "u+rwX,g-rwx,o-rwx" "$media_dir" 2>/dev/null || true
elif command -v setfacl >/dev/null 2>&1; then
  setfacl -R -m 'u:10001:rwx' -m 'd:u:10001:rwx' "$media_dir" 2>/dev/null || true
else
  echo 'warning: could not chown media to 10001; app may need ACL/sudo prepare-data-dirs' >&2
fi

printf 'Database and uploads imported.\n'
printf '  media -> %s\n' "$media_dir"
printf 'Start the stack: docker compose up -d\n'
