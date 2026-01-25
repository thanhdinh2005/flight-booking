<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegisterController;

Route::post('/register', [RegisterController::class, 'register']);

Route::middleware('auth.keycloak') -> group(function () {
	Route::get('/test', function () {
		return response()->json(['message' => 'Authenticated access granted']);
	});


});