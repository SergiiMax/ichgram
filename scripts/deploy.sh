#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> git pull"
git pull --ff-only

echo "==> build and start"
docker compose up -d --build --wait

echo "==> remove old images"
docker image prune -f

echo "==> status"
docker compose ps
curl -fsS https://ichgram.duckdns.org/api/v1/health
echo
echo "==> deploy done"
