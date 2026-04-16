#!/usr/bin/env bash
set -euo pipefail

RUN_MANUAL_BACKUP="false"
SKIP_AUTH_CHECKS="false"
LOGIN_EMAIL=""
LOGIN_PASSWORD=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-manual-backup)
      RUN_MANUAL_BACKUP="true"
      shift
      ;;
    --skip-auth-checks)
      SKIP_AUTH_CHECKS="true"
      shift
      ;;
    --login-email)
      LOGIN_EMAIL="$2"
      shift 2
      ;;
    --login-password)
      LOGIN_PASSWORD="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

step() {
  echo "[verify-prod] $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo ".env not found at repository root."
  exit 1
fi

get_env_value() {
  local key="$1"
  local fallback="${2:-}"
  local line
  line="$(grep -E "^\s*${key}=" "$ENV_FILE" | head -n 1 || true)"
  if [[ -z "$line" ]]; then
    echo "$fallback"
  else
    echo "${line#*=}"
  fi
}

APP_PORT="$(get_env_value APP_PORT 8080)"
SEED_ADMIN_EMAIL="${LOGIN_EMAIL:-$(get_env_value VERIFY_LOGIN_EMAIL "$(get_env_value SEED_ADMIN_EMAIL admin@guts.local)")}"
SEED_ADMIN_PASSWORD="${LOGIN_PASSWORD:-$(get_env_value VERIFY_LOGIN_PASSWORD "$(get_env_value SEED_ADMIN_PASSWORD)")}"

BASE_URL="http://localhost:${APP_PORT}"
step "Base URL: $BASE_URL"

step "Checking /api/health"
health_status="$(curl -sS "$BASE_URL/api/health" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(j.status||'');});")"
if [[ "$health_status" != "ok" ]]; then
  echo "Health check returned unexpected status: $health_status"
  exit 1
fi

step "Checking /api/health/ready"
ready_status="$(curl -sS "$BASE_URL/api/health/ready" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(j.status||'');});")"
if [[ "$ready_status" != "ready" ]]; then
  echo "Readiness check returned unexpected status: $ready_status"
  exit 1
fi

if [[ "$SKIP_AUTH_CHECKS" == "true" ]]; then
  step "Skipping auth-dependent checks by request."
  step "All production verification checks passed."
  exit 0
fi

if [[ -z "$SEED_ADMIN_PASSWORD" ]]; then
  echo "Login password missing. Set VERIFY_LOGIN_PASSWORD in .env or pass --login-password."
  exit 1
fi

step "Checking login endpoint with seed admin"
login_payload="$(printf '{"email":"%s","password":"%s"}' "$SEED_ADMIN_EMAIL" "$SEED_ADMIN_PASSWORD")"
token="$(curl -sS -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "$login_payload" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(j.token||'');});")"
if [[ -z "$token" ]]; then
  echo "Login response did not include token."
  exit 1
fi

step "Checking authenticated profile endpoint"
has_user="$(curl -sS "$BASE_URL/api/auth/me" -H "Authorization: Bearer $token" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(j.user ? 'yes' : 'no');});")"
if [[ "$has_user" != "yes" ]]; then
  echo "Profile endpoint did not return user payload."
  exit 1
fi

step "Checking backup status endpoint"
has_backup_status="$(curl -sS "$BASE_URL/api/backups/status" -H "Authorization: Bearer $token" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(Object.prototype.hasOwnProperty.call(j,'status') ? 'yes' : 'no');});")"
if [[ "$has_backup_status" != "yes" ]]; then
  echo "Backup status response missing 'status' field."
  exit 1
fi

if [[ "$RUN_MANUAL_BACKUP" == "true" ]]; then
  step "Triggering manual backup endpoint"
  backup_run_status="$(curl -sS -X POST "$BASE_URL/api/backups/run" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d '{}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);process.stdout.write(j.status||'');});")"
  if [[ "$backup_run_status" != "success" ]]; then
    echo "Manual backup did not return success status: $backup_run_status"
    exit 1
  fi
fi

step "All production verification checks passed."