#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.vercel}"
ENV_TARGET="${2:-production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE was not found." >&2
  echo "Create it from .env.vercel.example and put real Vercel secrets there." >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "ERROR: Vercel CLI was not found." >&2
  echo "Install it with: npm i -g vercel" >&2
  exit 1
fi

echo "Uploading environment variables from $ENV_FILE to Vercel target: $ENV_TARGET"
echo "Make sure you already ran: vercel login && vercel link"

while IFS='=' read -r key value || [[ -n "${key:-}" ]]; do
  key="${key#"${key%%[![:space:]]*}"}"
  key="${key%"${key##*[![:space:]]}"}"

  if [[ -z "$key" || "$key" == \#* ]]; then
    continue
  fi

  value="${value%$'\r'}"
  value="${value%\"}"
  value="${value#\"}"

  echo "Setting $key"
  vercel env rm "$key" "$ENV_TARGET" --yes >/dev/null 2>&1 || true
  printf "%s" "$value" | vercel env add "$key" "$ENV_TARGET" >/dev/null
done < "$ENV_FILE"

echo "Done. Redeploy Vercel after updating environment variables."
