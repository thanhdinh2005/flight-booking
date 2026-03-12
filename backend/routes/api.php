<?php

use App\Http\Controllers\api\FlightScheduleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\AirportController;


use app\Http\Controllers\Api\BookingController;


use App\Http\Controllers\api\CustomerBookingController;
use App\Http\Controllers\api\FlightInstanceController;
use App\Http\Controllers\api\PaymentController;
use App\Http\Controllers\api\StaffController;
use App\Http\Controllers\api\UserController;

Route::post('/updateAddon', [BookingController::class, 'addAddon']);
Route::post('/', [BookingController::class, 'store']);
Route::get('/airports/search', [AirportController::class, 'search']);
Route::get('/flights/search', [FlightController::class, 'search']);
Route::post('/register', [RegisterController::class, 'register']);

Route::get('payments/vnpay-return', [PaymentController::class, 'vnpayReturn']);
//Route::get('/vnpay-ipn', [PaymentController::class, 'vnpayIpn']);

Route::middleware('auth.keycloak') -> group(function () {
	Route::get('/test', function () {
		return response()->json(['message' => 'Authenticated access granted']);
	});
    
	Route::get('/me', [UserProfileController::class, 'getProfile']);
	Route::put('/me', [UserProfileController::class, 'updateProfile']);

    Route::post('/bookings/{bookingId}/refund-requests', [CustomerBookingController::class, 'requestRefund']);

    // Create Payment
    Route::post('/payments/vnpay/{bookingId}', [PaymentController::class, 'create']);



});

Route::middleware(['auth.keycloak', 'role:STAFF'])
    ->prefix('staff')
    ->group(function () {

        Route::post('/processing-refund/{bookingRequestId}/approve', [StaffController::class, 'approveRefundRequest']);
        Route::post('/processing-refund/{bookingRequestId}/reject', [StaffController::class, 'rejectRefundRequest']);

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
        Route::get('/schedules', [FlightScheduleController::class, 'getAll']);

        // Flight Instances API
        Route::post('/flight-instances', [FlightInstanceController::class, 'storeManualInstance']);
        Route::get('/flight-instances', [FlightInstanceController::class, 'getAll']);
        Route::get('/flight-instances/filter', [FlightInstanceController::class, 'filterFlight']);
        Route::get('/flight-instances/{id}', [FlightInstanceController::class, 'getById']);
        


        // User Management API
        Route::get('/users', [UserController::class, 'getAllUser']);
        Route::post('/users', [UserController::class, 'createUser']);
        Route::get('/users/search', [UserController::class, 'index']);
        Route::get('/users/{userId}', [UserController::class, 'getUserById']);
        Route::put('/users/{userId}/disable', [UserController::class, 'disable']);
        Route::put('/users/{userId}/active', [UserController::class, 'active']);
        


});