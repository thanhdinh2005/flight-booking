<?php

use App\Http\Controllers\api\FlightScheduleController;
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

Route::middleware(['auth.keycloak', 'role:STAFF'])
    ->prefix('staff')
    ->group(function () {

        // Route::get('/dashboard', [StaffController::class, 'dashboard']);
        // Route::get('/flights', [StaffController::class, 'manageFlights']);
});

Route::middleware(['auth.keycloak', 'role:ADMIN'])
    ->prefix('admin')
    ->group(function () {

		Route::post('/schedules', [FlightScheduleController::class, 'store']);
});