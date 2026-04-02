# FitTrack

FitTrack is a simple fitness tracking app built from the original `base-template.html` prototype and upgraded into a Laravel + React application.

## What It Does

- User registration and login with Laravel Sanctum API tokens
- One active workout session per user
- Autosaved exercises and completed sets
- Rest timer in the workout screen
- Session history with exercises, sets, and total volume

## Stack

- Laravel 13
- React + Vite
- MySQL via Laravel Sail for local development
- SQLite used for the fast feature-test path in this environment

## Local Development

The project is configured for Laravel Sail because PHP is not installed directly in this workspace.

1. Start the containers:

```bash
./vendor/bin/sail up -d
```

2. Run migrations:

```bash
./vendor/bin/sail artisan migrate
```

3. Install frontend dependencies if needed:

```bash
npm install
```

4. Start the Vite dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:8000`.

## Tests

Feature tests can be run quickly through the PHP container with SQLite:

```bash
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app composer:2 sh -lc "DB_CONNECTION=sqlite DB_DATABASE=/app/database/testing.sqlite CACHE_STORE=array QUEUE_CONNECTION=sync SESSION_DRIVER=array php artisan test --testsuite=Feature"
```

## Production Deployment

Production uses a separate Docker stack so local Sail remains unchanged.

- `compose.prod.yaml` builds two containers: `app` (`php-fpm`) and `web` (`nginx`)
- the app persists uploads, logs, cache, sessions, and the SQLite database in the `fittrack_storage` volume
- host `nginx` proxies public traffic to the Docker `web` container on `127.0.0.1:8080`

Basic VPS flow:

1. Copy `.env.production.example` to `.env.production` and set a real `APP_KEY`.
2. Copy `docker/prod/host-nginx-fittrack.conf` into the server `nginx` site config.
3. Run `scripts/deploy-vps.sh` from this machine to sync the project and rebuild the stack remotely.

## Main App Areas

- API auth: `routes/api.php` and `app/Http/Controllers/Api/AuthController.php`
- Workout session logic: `app/Services/WorkoutSessionService.php`
- React SPA entry: `resources/js/app.jsx`
- Workout UI: `resources/js/pages/WorkoutPage.jsx`
- History UI: `resources/js/pages/HistoryPage.jsx`
