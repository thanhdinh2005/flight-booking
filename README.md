# Flight Booking Backend

Backend service for the Flight Booking system built with **Laravel**.
This guide explains how to set up and run the backend locally.

------------------------------------------------------------------------

# Table of Contents

-   [System Requirements](#system-requirements)
-   [Backend Setup](#backend-setup)
-   [Environment Configuration](#environment-configuration)
-   [Run Docker Services](#run-docker-services)
-   [Keycloak Configuration](#keycloak-configuration)
-   [Initialize Laravel](#initialize-laravel)
-   [Access Backend API](#access-backend-api)
-   [Database Access (Adminer)](#database-access-adminer)
-   [API Documentation (Swagger)](#api-documentation-swagger)
-   [Troubleshooting](#troubleshooting)

------------------------------------------------------------------------

# System Requirements

Make sure the following tools are installed on your system:

-   Herd (includes PHP and Composer)
-   Docker Desktop

Verify installation:

``` bash
php -v
composer -v
docker -v
```

------------------------------------------------------------------------

# Backend Setup

## 1. Navigate to backend directory

``` bash
cd backend
```

## 2. Install dependencies

``` bash
composer install
```

------------------------------------------------------------------------

# Environment Configuration

1.  Create a `.env` file in the `backend` directory.

2.  Copy the content from `.env.example`

``` bash
cp .env.example .env
```

3.  Add the following configuration to the **end of the `.env` file**

``` env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=flight-booking-realm

KEYCLOAK_CLIENT_ID=backend-client
KEYCLOAK_CLIENT_SECRET=PS7SDvDmdr0DB0lQ0ekDzCNdlwlcZvp4

KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
```

------------------------------------------------------------------------

# Run Docker Services

Start all required containers:

``` bash
docker-compose up -d
```

Check running containers:

``` bash
docker ps
```

------------------------------------------------------------------------

# Keycloak Configuration

1.  Open Keycloak:

```{=html}
<!-- -->
```
    http://localhost:8080

2.  Login with:

```{=html}
<!-- -->
```
    Username: admin
    Password: admin123

3.  Create a new **Realm**

-   Click the realm dropdown near the Keycloak logo
-   Select **Create Realm**
-   Import the file:

```{=html}
<!-- -->
```
    /keycloak/realm-export.json

------------------------------------------------------------------------

# Initialize Laravel

Run the following commands:

``` bash
php artisan key:generate
php artisan config:clear
php artisan migrate:fresh --seed
```

------------------------------------------------------------------------

# Access Backend API

Base API URL:

    http://backend.test/api

Example test endpoint:

    GET http://backend.test/api/test

------------------------------------------------------------------------

# Database Access (Adminer)

Open:

    http://localhost:8083

Login credentials:

  Field      Value
  ---------- ----------------
  System     PostgreSQL
  Server     postgres
  Username   postgres
  Password   secret
  Database   flight_booking

------------------------------------------------------------------------

# API Documentation (Swagger)

Generate Swagger documentation:

``` bash
composer update -W
php artisan l5-swagger:generate
```

Open Swagger UI:

    http://backend.test/api/documentation

------------------------------------------------------------------------

# Troubleshooting

### Docker containers not running

``` bash
docker-compose down
docker-compose up -d
```

### Clear Laravel cache

``` bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

------------------------------------------------------------------------
