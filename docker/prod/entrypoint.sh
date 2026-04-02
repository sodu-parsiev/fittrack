#!/usr/bin/env sh
set -eu

mkdir -p \
    /var/www/html/bootstrap/cache \
    /var/www/html/storage/app/database \
    /var/www/html/storage/app/public \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/testing \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/logs

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    db_file="${DB_DATABASE:-/var/www/html/storage/app/database/database.sqlite}"
    mkdir -p "$(dirname "$db_file")"
    touch "$db_file"
fi

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

exec "$@"
