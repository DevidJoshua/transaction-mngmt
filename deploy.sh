#!/usr/bin/env bash
# Pull images and deploy the Prismalink stack to Docker Swarm.
#
# Usage:
#   ./deploy.sh
#
# Environment variables:
#   IMAGE_REGISTRY       Registry prefix incl. trailing slash (must match build-and-push.sh).
#   IMAGE_TAG            Image tag (default "latest").
#   POSTGRES_PASSWORD    DB password used to create the postgres_password secret.
#   JWT_SECRET           JWT signing secret used to create the jwt_secret secret.
#   STACK_NAME           Swarm stack name (default "plink5").

set -euo pipefail

IMAGE_REGISTRY="${IMAGE_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-change-me-db-password}"
JWT_SECRET="${JWT_SECRET:-change-me-jwt-secret}"
STACK_NAME="${STACK_NAME:-plink5}"

export IMAGE_REGISTRY IMAGE_TAG

# Pull the images the stack will run (interpolates the same vars as the compose file).
api="${IMAGE_REGISTRY}plink5-api:${IMAGE_TAG}"
web="${IMAGE_REGISTRY}plink5-web:${IMAGE_TAG}"
echo "==> Pulling ${api} and ${web}"
docker pull "${api}"
docker pull "${web}"

# Create the external Docker secrets if they don't exist yet.
if ! docker secret inspect postgres_password >/dev/null 2>&1; then
  echo "==> Creating secret postgres_password"
  printf '%s' "${POSTGRES_PASSWORD}" | docker secret create postgres_password -
fi
if ! docker secret inspect jwt_secret >/dev/null 2>&1; then
  echo "==> Creating secret jwt_secret"
  printf '%s' "${JWT_SECRET}" | docker secret create jwt_secret -
fi

echo "==> Deploying stack ${STACK_NAME}"
docker stack deploy -c docker-compose.swarm.yml --with-registry-auth "${STACK_NAME}"

echo "==> Done"
