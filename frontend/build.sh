#!/usr/bin/env bash
# Render build: bake API URL into Next.js (NEXT_PUBLIC_* is read at build time).
set -o errexit

cd "$(dirname "$0")"

if [[ -n "${VAULTCLUB_API_HOST:-}" ]]; then
  export NEXT_PUBLIC_API_URL="https://${VAULTCLUB_API_HOST}/api/v1"
elif [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  echo "WARN: Set VAULTCLUB_API_HOST or NEXT_PUBLIC_API_URL before build." >&2
fi

echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-<unset>}"
npm ci
npm run build
