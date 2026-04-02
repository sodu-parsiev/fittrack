#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER="${SERVER:-deploy@84.46.246.187}"
APP_DIR="${APP_DIR:-/home/deploy/apps/fittrack}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"
HOST_NGINX_CONF="${HOST_NGINX_CONF:-docker/prod/host-nginx-fittrack.conf}"
SITE_NAME="${SITE_NAME:-fittrack}"

rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'vendor/' \
  --exclude '.env' \
  --exclude '.env.production' \
  --exclude 'storage/logs/' \
  --exclude 'storage/framework/cache/data/' \
  --exclude 'storage/framework/sessions/' \
  --exclude 'storage/framework/testing/' \
  --exclude 'storage/framework/views/' \
  --exclude 'database/*.sqlite' \
  --exclude 'database/*.sqlite-journal' \
  "$ROOT_DIR/" "$SERVER:$APP_DIR/"

ssh "$SERVER" "cd '$APP_DIR' \
  && test -f .env.production \
  && docker compose -f '$COMPOSE_FILE' up -d --build \
  && docker compose -f '$COMPOSE_FILE' exec -T app php artisan optimize:clear --ansi \
  && docker compose -f '$COMPOSE_FILE' exec -T app php artisan package:discover --ansi \
  && docker compose -f '$COMPOSE_FILE' exec -T app php artisan migrate --force \
  && docker compose -f '$COMPOSE_FILE' exec -T app php artisan optimize --ansi \
  && if ! sudo test -f '/etc/nginx/sites-available/$SITE_NAME' || ! sudo grep -q 'managed by Certbot' '/etc/nginx/sites-available/$SITE_NAME'; then sudo install -m 644 '$APP_DIR/$HOST_NGINX_CONF' '/etc/nginx/sites-available/$SITE_NAME'; fi \
  && sudo ln -sfn '/etc/nginx/sites-available/$SITE_NAME' '/etc/nginx/sites-enabled/$SITE_NAME' \
  && sudo rm -f /etc/nginx/sites-enabled/default \
  && sudo nginx -t \
  && sudo systemctl reload nginx"
