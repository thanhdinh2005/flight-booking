<?php

namespace App\Http\Response;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="UserResponse",
 *     type="object",
 *     title="User Response",
 * 
 *     @OA\Property(
 *         property="id",
 *         type="string",
 *         example="1"
 *     ),
 * 
 *     @OA\Property(
 *         property="keycloak_id",
 *         type="string",
 *         example="d1a9c9a0-12ab-4c8c-9c1a-123456789abc"
 *     ),
 * 
 *     @OA\Property(
 *         property="email",
 *         type="string",
 *         format="email",
 *         example="user@example.com"
 *     ),
 * 
 *     @OA\Property(
 *         property="full_name",
 *         type="string",
 *         example="Nguyen Van A"
 *     ),
 * 
 *     @OA\Property(
 *         property="role",
 *         type="string",
 *         example="customer"
 *     ),
 * 
 *     @OA\Property(
 *         property="phone_number",
 *         type="string",
 *         example="0987654321"
 *     ),
 * 
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2026-03-07T10:00:00Z"
 *     ),
 * 
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2026-03-07T10:00:00Z"
 *     )
 * )
 */
final class UserResponse
{
    public function __construct(
        public string $id,
        public string $keycloak_id,
        public string $email,
        public string $full_name,
        public string $role,
        public string $phone_number,
        public string $created_at,
        public string $updated_at,
    ) {}
}
