#!/bin/sh
set -e

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-plink}"
if [ -f /run/secrets/postgres_password ]; then
  POSTGRES_PASSWORD="$(cat /run/secrets/postgres_password)"
fi

if [ -f /run/secrets/jwt_secret ]; then
  export JWT_SECRET="$(cat /run/secrets/jwt_secret)"
else
  export JWT_SECRET="${JWT_SECRET:-fallback-secret-not-for-prod}"
fi

export DATABASE_URL="postgresql://plink:${POSTGRES_PASSWORD}@${DB_HOST:-db}:5432/plink5?schema=public"

echo "[entrypoint] waiting for db + running prisma db push..."
until npx prisma db push --skip-generate; do
  echo "[entrypoint] db not ready, retrying in 3s..."
  sleep 3
done

echo "[entrypoint] seeding (idempotent)..."
npx ts-node prisma/seed.ts

echo "[entrypoint] starting api..."
exec node dist/main.js
