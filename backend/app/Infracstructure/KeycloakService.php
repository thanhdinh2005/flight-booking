<?php

namespace App\Infracstructure;

use Illuminate\Support\Facades\Http;
use App\Exceptions\KeycloakException;

class KeycloakService
{
    protected string $baseUrl;
    protected string $realm;
    protected string $clientId;
    protected string $clientSecret;

    public function __construct()
    {
        $this->baseUrl = config('keycloak.url');
        $this->realm = config('keycloak.realm');
        $this->clientId = config('keycloak.client_id');
        $this->clientSecret = config('keycloak.client_secret');
    }

    protected function adminToken(): string
    {
        return cache()->remember('keycloak_admin_token', 50, function () {
            $res = Http::asForm()->post(
                "{$this->baseUrl}/realms/{$this->realm}/protocol/openid-connect/token",
                [
                    'grant_type' => 'client_credentials',
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ]
            );

            return $res->json('access_token');
        });
    }

    public function createUser(
        string $email,
        string $password,
        string $firstName,
        string $lastName
    ): string {
        $response = Http::withToken($this->adminToken())
            ->post("{$this->baseUrl}/admin/realms/{$this->realm}/users", [
                'username'  => $email,
                'email'     => $email,
                'firstName' => $firstName,
                'lastName'  => $lastName,
                'enabled'   => true,
                'credentials' => [[
                    'type'      => 'password',
                    'value'     => $password,
                    'temporary' => false,
                ]],
            ]);

        if ($response->status() === 409) {
            throw new KeycloakException();
        }

        if ($response->failed()) {
            $message =
                $response->json('errorMessage')
                ?? $response->json('error')
                ?? json_encode($response->json())
                ?? 'Keycloak error';

            throw new KeycloakException($message);
        }

        $location = $response->header('Location');

        if (!$location) {
            throw new KeycloakException('Missing Location header from Keycloak');
        }

        return basename($location);
    }

    public function deleteUser(string $userId): void
    {
        Http::withToken($this->adminToken())
            ->delete("{$this->baseUrl}/admin/realms/{$this->realm}/users/{$userId}");
    }

    public function assignRealmRole(string $userId, string $roleName): void
    {
        $token = $this->adminToken();

        $roleResponse = Http::withToken($token)
            ->get("{$this->baseUrl}/admin/realms/{$this->realm}/roles/{$roleName}");

        if ($roleResponse->failed()) {
            throw new KeycloakException(
                "Role '{$roleName}' not found in realm"
            );
        }

        $role = $roleResponse->json();

        $assignResponse = Http::withToken($token)
            ->post(
                "{$this->baseUrl}/admin/realms/{$this->realm}/users/{$userId}/role-mappings/realm",
                [[
                    'id'   => $role['id'],
                    'name' => $role['name'],
                ]]
            );

        if ($assignResponse->failed()) {
            throw new KeycloakException(
                'Failed to assign role to user'
            );
        }
    }
}
