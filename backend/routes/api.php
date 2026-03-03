<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\UserProfileController;

Route::post('/register', [RegisterController::class, 'register']);

Route::middleware('auth.keycloak') -> group(function () {
	Route::get('/test', function () {
		return response()->json(['message' => 'Authenticated access granted']);
	});

	Route::get('/me', [UserProfileController::class, 'getProfile']);
	Route::put('/me', [UserProfileController::class, 'updateProfile']);


});