#!/usr/bin/env bash
# Build the Prismalink API + web images, and optionally push them to a registry.
#
# Usage:
#   ./build-and-push.sh
#
# Environment variables:
#   IMAGE_REGISTRY   Registry prefix incl. trailing slash, e.g. "registry.example.com/plink5/"
#                    Leave empty to build images locally only (no push).
#   IMAGE_TAG        Image tag (default "latest").

set -euo pipefail

IMAGE_REGISTRY="${IMAGE_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

api="${IMAGE_REGISTRY}plink5-api:${IMAGE_TAG}"
web="${IMAGE_REGISTRY}plink5-web:${IMAGE_TAG}"

echo "==> Building ${api}"
docker build -t "${api}" -f server/Dockerfile server

echo "==> Building ${web}"
docker build -t "${web}" -f Dockerfile.web .

if [ -n "${IMAGE_REGISTRY}" ]; then
  echo "==> Pushing ${api}"
  docker push "${api}"
  echo "==> Pushing ${web}"
  docker push "${web}"
else
  echo "==> IMAGE_REGISTRY unset — skipping push (local build only)"
fi

echo "==> Done"
