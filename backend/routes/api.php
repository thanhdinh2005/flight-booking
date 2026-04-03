<?php

use App\Http\Controllers\Api\FlightScheduleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\AirportController;
use App\Http\Controllers\api\AddonController;

use App\Http\Controllers\Api\AdminBookRequestController;

use App\Http\Controllers\Api\CustomerBookingController;

use App\Http\Controllers\Api\FlightInstanceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\api\AdminDashboardController;
use App\Http\Controllers\api\AircraftController;
use App\Http\Controllers\api\ReportController;
use App\Http\Controllers\api\CheckinController;
use App\Http\Controllers\api\RouteController;
use App\Http\Controllers\api\TicketController;

Route::options('{any}', function () {
    return response()->json([], 200);
})->where('any', '.*');


Route::get('/airports/search', [AirportController::class, 'search']);
Route::get('/airports/{airportId}', [AirportController::class, 'getAirportById']);
Route::get('/airports', [AirportController::class, 'getAll']);

Route::get('/flights/search', [FlightController::class, 'search']);
Route::post('/register', [RegisterController::class, 'register']);
Route::get('payments/vnpay-return', [PaymentController::class, 'vnpayReturn']);
Route::put('/forgot-password', [AdminDashboardController::class, 'forgotPassword']);
//Route::get('/vnpay-ipn', [PaymentController::class, 'vnpayIpn']);

Route::get('/booking', [BookingController::class, 'getByPnr']);

Route::middleware('auth.keycloak') -> group(function () {
	Route::get('/test', function () {
		return response()->json(['message' => 'Authenticated access granted']);
	});
    
	Route::get('/me', [UserProfileController::class, 'getProfile']);
	Route::put('/me', [UserProfileController::class, 'updateProfile']);

    // Create Payment
    Route::post('/payments/vnpay/{bookingId}', [PaymentController::class, 'create']);
    
    Route::post('/updateAddon', [BookingController::class, 'addAddon']);
    Route::post('/createBooking', [BookingController::class, 'store']);
    Route::get('/getAddon', [AddonController::class, 'getAll']);

    Route::post('/bookings/search-tickets', [CustomerBookingController::class, 'listActiveTickets']);
    Route::get('/refund/preview/{ticketId}', [CustomerBookingController::class, 'previewRefund']);
    Route::post('/refund/confirm', [CustomerBookingController::class, 'confirmRefund']);
    Route::post('/refund/cancel/{id}', [CustomerBookingController::class, 'cancelRefundRequest']);

    Route::post('/verify', [CheckinController::class, 'verifyIdentity']);
    Route::get('/seat-map', [CheckinController::class, 'getSeatMap']);
    Route::post('/submit', [CheckinController::class, 'submitCheckin']);
    Route::get('/checkin/boarding-pass/{id}', [CheckinController::class, 'getBoardingPass']);

    Route::get('tickets', [TicketController::class, 'getAll']);
});

Route::middleware(['auth.keycloak', 'role:ADMIN'])
    ->prefix('admin')
    ->group(function () {

        Route::get('/routes', [RouteController::class, 'index']);
        Route::get('/routes/{id}', [RouteController::class, 'getRouteById']);

        Route::get('/aircraft', [AircraftController::class, 'index']);
        Route::get('/aircraft/{id}', [AircraftController::class, 'getById']);

        Route::get('/booking-requests', [AdminBookRequestController::class, 'index']);
        Route::get('/booking-requests/{id}', [AdminBookRequestController::class, 'show']);
        Route::post('/booking-requests/{id}/approve', [AdminBookRequestController::class, 'approve']);
        Route::post('/booking-requests/{id}/reject', [AdminBookRequestController::class, 'reject']);

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
        Route::put('/flight-instances/{flightInstanceId}', [FlightInstanceController::class, 'updateFlight']);

        // User Management API
        Route::get('/users', [UserController::class, 'getAllUser']);
        Route::post('/users', [UserController::class, 'createUser']);
        Route::get('/users/search', [UserController::class, 'index']);
        Route::get('/users/{userId}', [UserController::class, 'getUserById']);
        Route::put('/users/{userId}/disable', [UserController::class, 'disable']);
        Route::put('/users/{userId}/active', [UserController::class, 'active']);
        Route::put('/users/change-role/{userId}', [UserController::class, 'changeRole']);
        
        // Statistic & Report API
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf']);
        Route::get('/dashboard/summary', [AdminDashboardController::class, 'getSummary']);
        Route::get('/revenue-chart', [AdminDashboardController::class, 'getChart']);
        Route::get('/top-route', [ReportController::class, 'getRouteChartData']);
});