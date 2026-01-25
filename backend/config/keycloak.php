<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Base URL
    |--------------------------------------------------------------------------
    */
    'url' => env('KEYCLOAK_URL'),

    /*
    |--------------------------------------------------------------------------
    | Realm
    |--------------------------------------------------------------------------
    */
    'realm' => env('KEYCLOAK_REALM'),

    /*
    |--------------------------------------------------------------------------
    | Client (Backend)
    |--------------------------------------------------------------------------
    */
    'client_id' => env('KEYCLOAK_CLIENT_ID'),
    'client_secret' => env('KEYCLOAK_CLIENT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Admin account (for register user)
    |--------------------------------------------------------------------------
    */
    'admin' => [
        'username' => env('KEYCLOAK_ADMIN_USERNAME'),
        'password' => env('KEYCLOAK_ADMIN_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Derived URLs
    |--------------------------------------------------------------------------
    */
    'token_url' => env('KEYCLOAK_URL')
        . '/realms/' . env('KEYCLOAK_REALM')
        . '/protocol/openid-connect/token',

    'jwks_url' => env('KEYCLOAK_URL')
        . '/realms/' . env('KEYCLOAK_REALM')
        . '/protocol/openid-connect/certs',

    'issuer' => env('KEYCLOAK_URL')
        . '/realms/' . env('KEYCLOAK_REALM'),
];
