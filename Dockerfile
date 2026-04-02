# syntax=docker/dockerfile:1.7

FROM php:8.4-fpm-bookworm AS php-base

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libonig-dev \
        libsqlite3-dev \
        libxml2-dev \
        unzip \
    && docker-php-ext-install \
        bcmath \
        mbstring \
        opcache \
        pdo_sqlite \
        xml \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

FROM php-base AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

COPY . .

RUN composer dump-autoload --no-dev --classmap-authoritative

FROM node:20-bookworm-slim AS frontend

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.js ./

RUN npm run build

FROM php-base AS app

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build
COPY docker/prod/entrypoint.sh /usr/local/bin/app-entrypoint

RUN chmod +x /usr/local/bin/app-entrypoint \
    && rm -f bootstrap/cache/*.php \
    && rm -rf storage/* \
    && mkdir -p \
        bootstrap/cache \
        storage/app/database \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]

FROM nginx:1.27-bookworm AS web

WORKDIR /var/www/html

COPY public ./public
COPY --from=frontend /app/public/build ./public/build

RUN ln -sf /var/www/html/storage/app/public /var/www/html/public/storage

COPY docker/prod/nginx/default.conf /etc/nginx/conf.d/default.conf
