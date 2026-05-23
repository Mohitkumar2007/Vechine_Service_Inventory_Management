#!/usr/bin/env bash
set -euo pipefail

DOCKERHUB_USERNAME="${1:-${DOCKERHUB_USERNAME:-mohitkumar2007}}"
IMAGE_TAG="${2:-${IMAGE_TAG:-latest}}"

BACKEND_IMAGE="$DOCKERHUB_USERNAME/vehicle-service-backend:$IMAGE_TAG"
FRONTEND_IMAGE="$DOCKERHUB_USERNAME/vehicle-service-frontend:$IMAGE_TAG"

echo "Docker Hub username: $DOCKERHUB_USERNAME"
echo "Image tag: $IMAGE_TAG"
echo

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker is not running or current user cannot access Docker." >&2
  exit 1
fi

echo "Building backend image: $BACKEND_IMAGE"
docker build -f backend/Dockerfile -t "$BACKEND_IMAGE" .

echo "Building frontend image: $FRONTEND_IMAGE"
docker build -f frontend/Dockerfile -t "$FRONTEND_IMAGE" .

echo
echo "Pushing backend image..."
docker push "$BACKEND_IMAGE"

echo "Pushing frontend image..."
docker push "$FRONTEND_IMAGE"

echo
echo "Pushed Docker Hub images:"
echo "  $BACKEND_IMAGE"
echo "  $FRONTEND_IMAGE"
