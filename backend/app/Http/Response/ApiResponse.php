<?php

namespace App\Http\Response;

use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ApiResponse",
 *     type="object",
 *
 *     @OA\Property(
 *         property="success",
 *         type="boolean",
 *         example=true
 *     ),
 *
 *     @OA\Property(
 *         property="message",
 *         type="string",
 *         example="Success"
 *     ),
 *
 *     @OA\Property(
 *         property="data",
 *         type="object",
 *         nullable=true
 *     )
 * )
 */
class ApiResponse
{

    public static function success(mixed $data = null, string $message = "Success", int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    public static function error(mixed $message = "Error", int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => null,
        ], $status);
    }
}