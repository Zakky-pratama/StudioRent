<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\RentalController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

// Public endpoints
Route::post('/login', [AuthController::class, 'login']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/equipments', [EquipmentController::class, 'index']);
Route::get('/equipments/{id}', [EquipmentController::class, 'show']);

// Protected endpoints (Petugas & Admin)
Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/stats', [StatsController::class, 'index']);

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);

    Route::get('/rentals', [RentalController::class, 'index']);
    Route::post('/rentals', [RentalController::class, 'store']);
    Route::get('/rentals/{id}', [RentalController::class, 'show']);
    Route::put('/rentals/{id}/kembalikan', [RentalController::class, 'kembalikan']);

    // Admin only endpoints
    Route::middleware('admin')->group(function (): void {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        Route::post('/equipments', [EquipmentController::class, 'store']);
        Route::put('/equipments/{id}', [EquipmentController::class, 'update']);
        Route::delete('/equipments/{id}', [EquipmentController::class, 'destroy']);
    });
});
