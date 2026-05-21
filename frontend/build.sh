#!/usr/bin/env bash
# Render build: bake API URL into Next.js (NEXT_PUBLIC_* is read at build time).
set -o errexit

cd "$(dirname "$0")"

if [[ -n "${NEXT_PUBLIC_API_URL:-}" ]]; then
  :
elif [[ -n "${VAULTCLUB_API_PUBLIC_URL:-}" ]]; then
  base="${VAULTCLUB_API_PUBLIC_URL%/}"
  export NEXT_PUBLIC_API_URL="${base}/api/v1"
elif [[ -n "${VAULTCLUB_API_HOST:-}" ]]; then
  # Legacy: host may be a private IP on Render — prefer VAULTCLUB_API_PUBLIC_URL.
  export NEXT_PUBLIC_API_URL="https://${VAULTCLUB_API_HOST}/api/v1"
else
  echo "WARN: Set VAULTCLUB_API_PUBLIC_URL or NEXT_PUBLIC_API_URL before build." >&2
fi

echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-<unset>}"
npm ci
npm run build
