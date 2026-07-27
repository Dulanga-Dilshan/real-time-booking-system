<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\RouteController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\TrackingController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\Admin\AdminRouteController;
use App\Http\Controllers\Api\V1\Admin\AdminBookingController;
use App\Http\Controllers\Api\V1\Admin\AdminDriverController;
use App\Http\Controllers\Api\V1\Admin\AdminRouteTemplateController;

Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
    });

    // Public routes
    Route::get('/routes',               [RouteController::class, 'index']);
    Route::get('/routes/{busRoute}',    [RouteController::class, 'show']);
    Route::get('/routes/{busRoute}/seats', [RouteController::class, 'seats']);
    Route::get('/tracking',             [TrackingController::class, 'index']);
    Route::get('/tracking/{busRoute}',  [TrackingController::class, 'show']);

    // Bookings (public — no auth needed to book)
    Route::post('/bookings',                         [BookingController::class, 'store']);
    Route::get('/bookings/{reference}',              [BookingController::class, 'show']);
    Route::post('/bookings/{reference}/cancel',      [BookingController::class, 'cancel']);
    Route::get('/bookings/{reference}/receipt',      [BookingController::class, 'downloadReceipt']);
    Route::post('/bookings/{reference}/email-receipt',[BookingController::class, 'emailReceipt']);

    // Profile (auth required)
    Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
        Route::get('/',          [ProfileController::class, 'show']);
        Route::get('/bookings',  [ProfileController::class, 'bookings']);
        Route::post('/password', [ProfileController::class, 'updatePassword']);
    });

    // Driver (bus_staff)
    Route::middleware(['auth:sanctum', 'role.staff'])->prefix('driver')->group(function () {
        Route::get('/',        [DriverController::class, 'dashboard']);
        Route::post('/location', [DriverController::class, 'updateLocation']);
        Route::post('/gps',      [DriverController::class, 'updateGps']);
        Route::post('/mode',     [DriverController::class, 'setTrackingMode']);
    });

    // Admin
    Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->group(function () {
        Route::get('/stats', [AdminBookingController::class, 'stats']);

        Route::apiResource('routes',           AdminRouteController::class);
        Route::apiResource('route-templates',  AdminRouteTemplateController::class);

        Route::get('/bookings',              [AdminBookingController::class, 'index']);
        Route::post('/bookings/{booking}/cancel', [AdminBookingController::class, 'cancel']);

        Route::get('/drivers',                    [AdminDriverController::class, 'index']);
        Route::post('/drivers/{user}/assign',     [AdminDriverController::class, 'assign']);
        Route::post('/drivers/{user}/unassign',   [AdminDriverController::class, 'unassign']);
    });
});