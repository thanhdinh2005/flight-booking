<?php

use App\Http\Controllers\api\FlightScheduleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\AirportController;
use App\Http\Controllers\api\CustomerBookingController;
use App\Http\Controllers\api\FlightInstanceController;
use App\Http\Controllers\api\UserController;

Route::get('/airports/search', [AirportController::class, 'search']);
Route::get('/flights/search', [FlightController::class, 'search']);
Route::post('/register', [RegisterController::class, 'register']);

Route::middleware('auth.keycloak') -> group(function () {
	Route::get('/test', function () {
		return response()->json(['message' => 'Authenticated access granted']);
	});

	Route::get('/me', [UserProfileController::class, 'getProfile']);
	Route::put('/me', [UserProfileController::class, 'updateProfile']);

    Route::post('/bookings/{bookingId}/refund-requests', [CustomerBookingController::class, 'requestRefund']);

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

        // Flight Schedules API
        Route::put('/schedules/{id}/phase-out', [FlightScheduleController::class, 'phaseOutSchedule']);
		Route::put('/schedules/{id}/reactivate', [FlightScheduleController::class, 'reactivateSchedule']);
        Route::post('/schedules', [FlightScheduleController::class, 'store']);

        // Flight Instances API
        Route::post('/flight-instances', [FlightInstanceController::class, 'storeManualInstance']);
        
        // User Management API
        Route::get('/users', [UserController::class, 'getAllUser']);
        Route::post('/users', [UserController::class, 'createUser']);
        Route::get('/users/search', [UserController::class, 'index']);
        Route::get('/users/{userId}', [UserController::class, 'getUserById']);
        Route::put('/users/{userId}/disable', [UserController::class, 'disable']);
        Route::put('/users/{userId}/active', [UserController::class, 'active']);
        


});