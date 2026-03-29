<?php

namespace App\Infracstructure;

use App\Exceptions\BusinessException;
use Illuminate\Support\Facades\Http;
use App\Exceptions\KeycloakException;
use Illuminate\Support\Facades\Log;

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

    public function removeRealmRole(string $userId, string $roleName): void
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

        $removeResponse = Http::withToken($token)
            ->delete(
                "{$this->baseUrl}/admin/realms/{$this->realm}/users/{$userId}/role-mappings/realm",
                [[
                    'id'   => $role['id'],
                    'name' => $role['name'],
                ]]
            );

        if ($removeResponse->failed()) {
            throw new KeycloakException(
                'Failed to remove role from user'
            );
        }
    }

    public function getUserIdByEmail(string $email): ?string
    {
        $token = $this->adminToken();

        $res = Http::withToken($token)->get(
            "{$this->baseUrl}/admin/realms/{$this->realm}/users",
            [
                'email' => $email,
                'exact' => 'true' // Bắt buộc để tránh tìm tương đối (VD: abc@gmail khớp với abc@gmail.com)
            ]
        );

        if ($res->failed() || empty($res->json())) {
            return null;
        }

        // Keycloak trả về một mảng các user khớp điều kiện, ta lấy ID của user đầu tiên
        return $res->json('0.id'); 
    }

    /**
     * Bắn lệnh gửi email Reset Password tới user
     */
    public function sendResetPasswordEmail(string $userId, ?string $redirectUri = null): bool
    {
        $token = $this->adminToken();

        // Xây dựng URL cơ bản
        $url = "{$this->baseUrl}/admin/realms/{$this->realm}/users/{$userId}/execute-actions-email";

        // Thêm tham số redirect nếu muốn user đổi pass xong thì văng về lại Frontend
        $queryParams = [];
        if ($redirectUri) {
            $queryParams['client_id'] = $this->clientId; // Hoặc Client ID của Frontend nếu khác
            $queryParams['redirect_uri'] = $redirectUri;
            $url .= '?' . http_build_query($queryParams);
        }

        // Gửi mảng chứa action UPDATE_PASSWORD
        $res = Http::withToken($token)->put($url, ['UPDATE_PASSWORD']);

        if ($res->failed()) {
            Log::error("Keycloak Reset Password Error for User {$userId}: " . $res->body());
            throw new BusinessException('Không thể gửi email đặt lại mật khẩu lúc này.');
        }

        return true;
    }
}
