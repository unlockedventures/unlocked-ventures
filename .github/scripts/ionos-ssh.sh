#!/usr/bin/env bash
# Shared SSH/SCP helpers for IONOS deploy scripts.
# Prefer IONOS_SSH_PRIVATE_KEY (ssh-agent / BatchMode). Temporary fallback:
# Requires IONOS_SSH_PRIVATE_KEY (ssh-agent).
#
# Source from other scripts (does not set -e itself). Never echo secret values.

ionos_ssh_auth_mode() {
  if [[ -n "${IONOS_SSH_PRIVATE_KEY:-}" ]]; then
    printf '%s\n' key
  elif [[ -n "${IONOS_SSH_PASSWORD:-}" ]]; then
    printf '%s\n' password
  else
    printf '%s\n' missing
  fi
}

ionos_require_ssh_auth() {
  case "$(ionos_ssh_auth_mode)" in
    key | password) return 0 ;;
    *)
      echo '::error::Set IONOS_SSH_PRIVATE_KEY (preferred) or temporary IONOS_SSH_PASSWORD.' >&2
      return 1
      ;;
  esac
}

# ssh/scp option array name is filled by caller via nameref-style eval-free append.
ionos_ssh_base_opts() {
  if [[ "$(ionos_ssh_auth_mode)" == password ]]; then
    printf '%s\0' \
      -o PreferredAuthentications=password \
      -o PubkeyAuthentication=no \
      -o StrictHostKeyChecking=yes
  else
    printf '%s\0' -o BatchMode=yes -o StrictHostKeyChecking=yes
  fi
}

ionos_ssh() {
  ionos_require_ssh_auth
  local -a opts=()
  local opt
  while IFS= read -r -d '' opt; do
    opts+=("$opt")
  done < <(ionos_ssh_base_opts)

  if [[ "$(ionos_ssh_auth_mode)" == password ]]; then
    command -v sshpass >/dev/null 2>&1 || {
      echo '::error::sshpass required for IONOS_SSH_PASSWORD auth.' >&2
      return 1
    }
    SSHPASS="${IONOS_SSH_PASSWORD}" sshpass -e ssh "${opts[@]}" "$@"
  else
    ssh "${opts[@]}" "$@"
  fi
}

ionos_scp() {
  ionos_require_ssh_auth
  local -a opts=()
  local opt
  while IFS= read -r -d '' opt; do
    opts+=("$opt")
  done < <(ionos_ssh_base_opts)

  if [[ "$(ionos_ssh_auth_mode)" == password ]]; then
    command -v sshpass >/dev/null 2>&1 || {
      echo '::error::sshpass required for IONOS_SSH_PASSWORD auth.' >&2
      return 1
    }
    SSHPASS="${IONOS_SSH_PASSWORD}" sshpass -e scp "${opts[@]}" "$@"
  else
    scp "${opts[@]}" "$@"
  fi
}
