<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRoleController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/company', [CompanyController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile/email/send-code', [ProfileController::class, 'sendEmailVerificationCode']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/permissions', [PermissionController::class, 'index'])
        ->middleware('permission:permissions.view');

    Route::get('/roles', [RoleController::class, 'index'])
        ->middleware('permission:roles.view');
    Route::post('/roles', [RoleController::class, 'store'])
        ->middleware('permission:roles.create');
    Route::get('/roles/{role}', [RoleController::class, 'show'])
        ->middleware('permission:roles.view');
    Route::patch('/roles/{role}', [RoleController::class, 'update'])
        ->middleware('permission:roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
        ->middleware('permission:roles.delete');
    Route::put('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])
        ->middleware('permission:roles.update');

    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:users.view');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:users.create');
    Route::get('/users/{user}', [UserController::class, 'show'])
        ->middleware('permission:users.view');
    Route::post('/users/{user}/roles', [UserRoleController::class, 'store'])
        ->middleware('permission:users.update');
    Route::delete('/users/{user}/roles/{role}', [UserRoleController::class, 'destroy'])
        ->middleware('permission:users.update');

    Route::get('/customers', [CustomerController::class, 'index'])->middleware('permission:customers.view');
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('permission:customers.create');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->middleware('permission:customers.view');
    Route::patch('/customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:customers.delete');

    Route::get('/products', [ProductController::class, 'index'])->middleware('permission:products.view');
    Route::post('/products', [ProductController::class, 'store'])->middleware('permission:products.create');
    Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('permission:products.view');
    Route::patch('/products/{product}', [ProductController::class, 'update'])->middleware('permission:products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware('permission:products.delete');

    // ── Inventory ──────────────────────────────────────────────────────────

    Route::get('/inventory', [InventoryController::class, 'dashboard'])
        ->middleware('permission:inventory.view');

    Route::get('/inventory/stock', [InventoryController::class, 'stockOverview'])
        ->middleware('permission:inventory.view');

    Route::get('/inventory/movements', [InventoryController::class, 'stockMovements'])
        ->middleware('permission:inventory.movements');

    Route::get('/inventory/adjustments', [InventoryController::class, 'adjustments'])
        ->middleware('permission:inventory.adjust');
    Route::get('/inventory/adjustments/{adjustment}', [InventoryController::class, 'showAdjustment'])
        ->middleware('permission:inventory.adjust');
    Route::post('/inventory/adjustments', [InventoryController::class, 'storeAdjustment'])
        ->middleware('permission:inventory.adjust');

    Route::get('/inventory/transfers', [InventoryController::class, 'transfers'])
        ->middleware('permission:inventory.transfer');
    Route::get('/inventory/transfers/{transfer}', [InventoryController::class, 'showTransfer'])
        ->middleware('permission:inventory.transfer');
    Route::post('/inventory/transfers', [InventoryController::class, 'storeTransfer'])
        ->middleware('permission:inventory.transfer');
    Route::patch('/inventory/transfers/{transfer}/complete', [InventoryController::class, 'completeTransfer'])
        ->middleware('permission:inventory.transfer');

    // ── Warehouses ──────────────────────────────────────────────────────────

    Route::get('/warehouses', [InventoryController::class, 'warehouses'])
        ->middleware('permission:warehouses.view');
    Route::post('/warehouses', [InventoryController::class, 'storeWarehouse'])
        ->middleware('permission:warehouses.create');
    Route::get('/warehouses/{warehouse}', [InventoryController::class, 'showWarehouse'])
        ->middleware('permission:warehouses.view');
    Route::patch('/warehouses/{warehouse}', [InventoryController::class, 'updateWarehouse'])
        ->middleware('permission:warehouses.update');
    Route::delete('/warehouses/{warehouse}', [InventoryController::class, 'deactivateWarehouse'])
        ->middleware('permission:warehouses.delete');

    // ── Warehouse Locations ──────────────────────────────────────────────────

    Route::get('/warehouses/{warehouse}/locations', [InventoryController::class, 'warehouseLocations'])
        ->middleware('permission:warehouses.view');
    Route::post('/warehouses/{warehouse}/locations', [InventoryController::class, 'storeLocation'])
        ->middleware('permission:warehouses.create');
    Route::patch('/locations/{location}', [InventoryController::class, 'updateLocation'])
        ->middleware('permission:warehouses.update');
    Route::delete('/locations/{location}', [InventoryController::class, 'deleteLocation'])
        ->middleware('permission:warehouses.delete');
});