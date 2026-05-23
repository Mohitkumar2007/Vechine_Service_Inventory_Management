#!/usr/bin/env bash
set -euo pipefail

DOCKERHUB_USERNAME="${1:-${DOCKERHUB_USERNAME:-mohitkumar2007}}"
IMAGE_TAG="${2:-${IMAGE_TAG:-latest}}"

export DOCKERHUB_USERNAME
export IMAGE_TAG

if [[ ! -f ".env" ]]; then
  echo "ERROR: .env not found. Create it from .env.example and set MYSQL_PASSWORD before deploying." >&2
  exit 1
fi

docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d

echo "Deployment started."
echo "Frontend: http://localhost:3000"
echo "Backend health through frontend: http://localhost:3000/api/health/"
