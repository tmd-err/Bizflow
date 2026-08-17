# Stock Transfer Service — Fix Warehouse/Transfer Validation

## Objective

Fix the current `StockTransferService` error that prevents creating a **New Stock Transfer**.

Current error:

```text
App\\Services\\StockTransferService::ensureSameCompany():
Argument #2 ($transfer) must be of type App\\Models\\StockTransfer,
App\\Models\\Warehouse given
```

## Problem

`StockTransferService::ensureSameCompany()` is intended to validate a `StockTransfer`.

It expects:

```php
private function ensureSameCompany(User $actor, StockTransfer $transfer): void
```

But somewhere in `StockTransferService`, a `Warehouse` object is being passed to it.

This is incorrect.

## Required architecture

### StockTransferService

Responsible for:

- Creating stock transfers
- Updating stock transfers
- Listing stock transfers
- Showing stock transfers
- Validating that a `StockTransfer` belongs to the authenticated user's company

Transfer validation should remain:

```php
private function ensureSameCompany(User $actor, StockTransfer $transfer): void
```

### WarehouseService

Responsible for:

- Warehouse CRUD
- Validating warehouse ownership/company
- Warehouse-specific operations

Warehouse validation should be handled by a warehouse-specific method, for example:

```php
private function ensureSameCompany(User $actor, Warehouse $warehouse): void
```

or:

```php
private function ensureWarehouseSameCompany(User $actor, Warehouse $warehouse): void
```

Do **not** define two methods with the same name and different parameter types in the same PHP class. PHP does not support method overloading this way.

## What to check

Inspect:

```text
app/Services/StockTransferService.php
app/Services/WarehouseService.php
```

Especially:

- `create()` / `store()` logic
- warehouse lookup
- source warehouse validation
- destination warehouse validation
- `ensureSameCompany()`
- renamed warehouse-validation methods
- calls between `StockTransferService` and `WarehouseService`

Find any code equivalent to:

```php
$this->ensureSameCompany($actor, $warehouse);
```

inside `StockTransferService`.

That is wrong because `$warehouse` is a `Warehouse`, while that method expects a `StockTransfer`.

## Expected behavior when creating a transfer

When creating a transfer:

1. Get the authenticated `User`.
2. Get the source warehouse.
3. Get the destination warehouse.
4. Verify both warehouses belong to the user's company.
5. Create the `StockTransfer`.
6. The resulting transfer must belong to the user's company.

Do not remove company isolation.

## Important

This is a **bug fix**, not a new feature.

- Do not redesign the architecture.
- Do not rename unrelated methods.
- Do not modify database migrations.
- Do not modify the `StockTransfer` or `Warehouse` schema.
- Do not break working Warehouse CRUD.
- Do not modify frontend code unless the backend fix reveals a genuine frontend issue.

## Final verification

Run:

```bash
php artisan optimize:clear
```

Then test:

- Create New Stock Transfer
- List Stock Transfers
- Show Stock Transfer
- Verify source warehouse
- Verify destination warehouse
- Verify company isolation

The **New Stock Transfer** creation must work without the `Warehouse given` type error.
