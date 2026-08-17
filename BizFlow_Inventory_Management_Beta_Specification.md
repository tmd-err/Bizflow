# BizFlow ERP — Inventory Management Feature Specification

## 1. Purpose

Implement the **Inventory Management** feature for BizFlow ERP as the next major beta feature after Product Management (CRUD).

The project already contains a substantial inventory database structure. **Do not create duplicate inventory tables, migrations, models, services, controllers, routes, or frontend functionality when an equivalent implementation already exists.**

The first step is always to inspect the existing repository and reuse what is already there.

---

# 2. Critical Rule — Inspect Before Creating

This rule is mandatory.

> **IF IT ALREADY EXISTS, DO NOT CREATE IT AGAIN.**
>
> **IF THE DATABASE TABLE/MIGRATION ALREADY EXISTS, DO NOT CREATE ANOTHER MIGRATION FOR THE SAME CONCEPT.**
>
> **IF A MODEL/SERVICE/REQUEST/CONTROLLER/API ROUTE ALREADY EXISTS AND IS USABLE, EXTEND OR COMPLETE IT INSTEAD OF DUPLICATING IT.**
>
> **IF A FRONTEND COMPONENT/PAGE/API CLIENT ALREADY EXISTS AND CAN BE REUSED, REUSE IT.**

Before making changes, inspect:

```text
erp-api/
├── database/migrations/
├── app/Models/
├── app/Services/
├── app/Http/Controllers/
├── app/Http/Requests/
└── routes/
```

and the Next.js frontend:

```text
BizFlow/
├── app/
├── components/
├── hooks/
└── lib/api/
```

Do not assume that something is missing simply because the UI is missing.

The database already contains inventory-related tables.

---

# 3. Existing Database Architecture

The current database already contains:

```text
warehouses
warehouse_locations

stock_movements

stock_adjustments
stock_adjustment_items

stock_transfers
stock_transfer_items
```

It also contains related ERP tables:

```text
products
product_categories
product_brands
product_variants
product_prices

goods_receipts
goods_receipt_items

purchase_requests
purchase_request_items
purchase_orders
purchase_order_items

sales_orders
sales_order_items

deliveries
delivery_items

invoices
invoice_items
payments
```

Therefore:

## DO NOT create

```text
inventories
inventory_items
product_stock
warehouse_stock
```

or any equivalent table unless repository inspection proves that a genuinely missing database concept is required.

The existing schema must remain the source of truth.

---

# 4. Existing Inventory Tables

The following structure has been verified in PostgreSQL.

## 4.1 warehouses

```text
id
company_id
code
name
address
city
is_active
created_at
updated_at
```

A warehouse belongs to a company.

The authenticated user's `company_id` must always scope warehouse access.

## 4.2 warehouse_locations

```text
id
warehouse_id
code
name
created_at
updated_at
```

A warehouse can contain multiple locations.

Example:

```text
Warehouse A
├── A-01
├── A-02
└── A-03
```

Do not create another location table.

## 4.3 stock_movements

Verified columns:

```text
id
company_id
product_id
warehouse_id
location_id
type
quantity
unit_cost
reference_type
reference_id
created_by
notes
created_at
updated_at
```

This table represents the stock ledger.

The implementation must respect the existing meaning of these fields.

Do not create a second stock ledger.

## 4.4 stock_adjustments

Verified columns:

```text
id
company_id
warehouse_id
reference
reason
created_by
created_at
updated_at
```

## 4.5 stock_adjustment_items

Verified columns:

```text
id
stock_adjustment_id
product_id
system_quantity
actual_quantity
difference
created_at
updated_at
```

An adjustment compares system stock with physically counted stock.

Example:

```text
System quantity: 50
Actual quantity: 47
Difference:      -3
```

Use the existing adjustment architecture.

## 4.6 stock_transfers

Verified columns:

```text
id
company_id
from_warehouse_id
to_warehouse_id
reference
status
created_by
created_at
updated_at
```

## 4.7 stock_transfer_items

Verified columns:

```text
id
stock_transfer_id
product_id
quantity
created_at
updated_at
```

Transfers represent movement between warehouses.

Example:

```text
Warehouse A
    ↓
20 units
    ↓
Warehouse B
```

Use the existing transfer schema.

---

# 5. Product Relationship

Products already exist and have company ownership.

The existing Product structure includes:

```text
id
company_id
category_id
brand_id
sku
name
description
type
barcode
unit
cost_price
selling_price
minimum_stock
maximum_stock
image
is_active
```

Inventory must reference the existing `products` table.

Do not add a duplicate product stock system.

---

# 6. Important Stock Architecture Rule

Do not automatically add a `stock` or `quantity` column to `products`.

The existing architecture is centered around:

```text
Product
   ↓
Stock Movements
   ↓
Warehouse
   ↓
Location
```

Current stock should be calculated according to the existing backend architecture.

Before implementing stock calculations, inspect the current Laravel code for:

```text
StockMovement
stock_movements
quantity
stock
inventory
```

If a stock calculation service/query already exists:

> **Reuse it.**

If it does not exist:

> **Implement one centralized stock calculation service/query.**

Do not implement separate stock calculations in multiple controllers.

---

# 7. Required Backend Inspection — Step 1

Before changing code, inspect all existing inventory-related backend files.

Search for:

```text
StockMovement
StockAdjustment
StockAdjustmentItem
StockTransfer
StockTransferItem
Warehouse
WarehouseLocation
```

Also search for:

```text
stock_movements
stock_adjustments
stock_adjustment_items
stock_transfers
stock_transfer_items
warehouses
warehouse_locations
```

Determine:

1. Which Models already exist?
2. Which relationships already exist?
3. Which Services already exist?
4. Which Requests already exist?
5. Which Controllers already exist?
6. Which routes already exist?
7. Which permissions already exist?
8. Which stock calculation logic already exists?
9. Which frontend API functions already exist?
10. Which frontend pages/components already exist?

Do not start by generating files. First understand the repository.

---

# 8. Architecture Requirements

Follow the existing BizFlow Clean Architecture.

Do NOT put business logic inside routes.

Expected backend flow:

```text
Route
  ↓
Controller
  ↓
Form Request / Validation
  ↓
Service
  ↓
Model / Database
```

Controllers should remain thin.

Business rules belong in Services.

Validation belongs in Form Requests.

Do not bypass the service layer.

---

# 9. Multi-Tenant / Company Isolation

Every inventory operation must respect the authenticated user's company.

Example:

```text
Authenticated User
        ↓
company_id = 7
        ↓
Warehouse company_id = 7
        ↓
Product company_id = 7
        ↓
Stock movement company_id = 7
```

A user from Company 7 must never:

- view Company 8 warehouses
- view Company 8 stock
- adjust Company 8 stock
- transfer Company 8 stock
- manipulate Company 8 movements

Do not trust `company_id` from the frontend.

The backend must derive/validate company ownership from the authenticated actor.

---

# 10. Permissions

Inspect existing permissions first.

If inventory permissions already exist, reuse them.

If they do not exist, add only the minimum required permissions:

```text
inventory.view
inventory.movements
inventory.adjust
inventory.transfer
warehouses.view
warehouses.create
warehouses.update
warehouses.delete
```

Do not create duplicate permission records.

Follow the same permission architecture already used for Customers and Products.

---

# 11. Inventory Beta Scope

The first beta version should contain:

1. Inventory dashboard
2. Stock overview
3. Stock movement history
4. Stock adjustments
5. Stock transfers
6. Warehouse management
7. Warehouse location management, if not already implemented

---

# 12. Inventory Dashboard

Display useful stock information:

```text
Total products with stock
Total stock quantity
Low-stock products
Out-of-stock products
Stock value, if existing cost data supports it
```

Do not over-engineer the dashboard.

Dashboard values must come from the centralized stock logic.

---

# 13. Stock Overview

Create a page where the user can see stock by product.

Recommended information:

```text
SKU
Product
Warehouse
Location
Current Quantity
Minimum Stock
Status
```

Statuses may include:

```text
In Stock
Low Stock
Out of Stock
```

Use the existing Product fields:

```text
minimum_stock
maximum_stock
```

where appropriate.

---

# 14. Warehouse Filtering

The stock overview should support warehouse filtering if supported by the existing architecture.

Example:

```text
All Warehouses
Warehouse A
Warehouse B
Warehouse C
```

A company can only see its own warehouses.

---

# 15. Stock Movement History

Create a movement history page.

Display:

```text
Date
Product
Warehouse
Location
Type
Quantity
Unit Cost
Reference
Created By
Notes
```

Use the existing `stock_movements` table.

Do not create a second movement table.

---

# 16. Movement Types

Before defining allowed movement types, inspect existing backend/database conventions.

Do not blindly introduce new values if the project already defines them.

Conceptually, the system may need:

```text
IN
OUT
ADJUSTMENT
TRANSFER_IN
TRANSFER_OUT
```

But preserve whatever exact values the existing repository uses.

---

# 17. Stock Adjustments

Provide a UI for authorized users to perform a stock adjustment.

Workflow:

```text
Select Warehouse
       ↓
Select Product(s)
       ↓
Show System Quantity
       ↓
Enter Actual Quantity
       ↓
Calculate Difference
       ↓
Enter Reason
       ↓
Submit
       ↓
Create Adjustment
       ↓
Create corresponding Stock Movement(s)
```

Example:

```text
Product: NARIA
System: 50
Actual: 47
Difference: -3
Reason: Physical inventory count
```

Use the existing adjustment models/tables/services if available.

Use a database transaction for operations that modify multiple related records.

---

# 18. Stock Transfers

Provide a transfer workflow between warehouses.

Example:

```text
From:
Warehouse A

To:
Warehouse B

Product:
NARIA

Quantity:
20
```

Conceptual workflow:

```text
Create Transfer
      ↓
Transfer Items
      ↓
Pending
      ↓
Process / Complete
      ↓
Stock OUT from source
      ↓
Stock IN to destination
```

The exact statuses must follow existing database/backend conventions.

Validate:

- source warehouse belongs to current company
- destination warehouse belongs to current company
- source and destination are different
- product belongs to current company
- quantity is positive
- sufficient stock exists where required by the existing business rules

Use a transaction.

---

# 19. Warehouse Management

If warehouse CRUD is not already implemented, implement:

```text
List warehouses
Create warehouse
View warehouse
Update warehouse
Activate/deactivate warehouse
```

Use:

```text
warehouses
warehouse_locations
```

Do not create another warehouse table.

Warehouse form:

```text
code
name
address
city
is_active
```

---

# 20. Warehouse Locations

If location management is not already implemented, support:

```text
List locations
Create location
Update location
Deactivate/delete according to existing constraints
```

A location must belong to the selected warehouse.

Do not allow a user to assign a location from another company's warehouse.

---

# 21. API Design

Before adding routes, inspect existing routes.

Do not create duplicate routes.

Potential endpoints, only if equivalent routes do not already exist:

```text
GET    /api/inventory
GET    /api/inventory/movements
GET    /api/inventory/low-stock

POST   /api/inventory/adjustments
GET    /api/inventory/adjustments
GET    /api/inventory/adjustments/{id}

POST   /api/inventory/transfers
GET    /api/inventory/transfers
GET    /api/inventory/transfers/{id}
PATCH  /api/inventory/transfers/{id}

GET    /api/warehouses
POST   /api/warehouses
GET    /api/warehouses/{id}
PATCH  /api/warehouses/{id}
DELETE /api/warehouses/{id}

GET    /api/warehouses/{warehouse}/locations
POST   /api/warehouses/{warehouse}/locations
PATCH  /api/warehouse-locations/{location}
DELETE /api/warehouse-locations/{location}
```

These are proposed routes, not instructions to duplicate existing routes.

---

# 22. Frontend Architecture

Follow the same structure used by Product Management.

Target structure, only where missing:

```text
app/
└── dashboard/
    └── inventory/
        ├── page.tsx
        ├── movements/
        │   └── page.tsx
        ├── adjustments/
        │   ├── page.tsx
        │   └── new/
        │       └── page.tsx
        ├── transfers/
        │   ├── page.tsx
        │   └── new/
        │       └── page.tsx
        └── warehouses/
            ├── page.tsx
            ├── new/
            │   └── page.tsx
            └── [id]/
                ├── page.tsx
                └── edit/
                    └── page.tsx
```

If equivalent pages already exist, reuse them.

For Next.js client components using hooks/client-side features, include:

```tsx
"use client";
```

where required.

---

# 23. Frontend API Client

Follow the existing API client architecture.

Potentially:

```text
lib/api/
├── products.ts
├── customers.ts
└── inventory.ts
```

If an inventory API client already exists:

> Extend it.

Do not create a second API client.

Use the existing:

```text
apiGet
apiPost
apiPatch
apiDelete
```

pattern.

---

# 24. Forms and Validation

Use the existing frontend stack:

```text
React Hook Form
Zod
shadcn/ui
Tailwind
```

Follow the same patterns already used in ProductForm and Customer forms.

Client validation improves UX, but Laravel remains the final authority.

---

# 25. Loading / Error / Success States

Every inventory operation should have:

```text
Loading state
Error state
Success feedback
Empty state
```

Reuse:

```text
useFormFeedback
getApiErrorMessage
```

where appropriate.

Do not introduce another notification system.

---

# 26. Security and Authorization

Every inventory page must use the existing permission system.

Examples:

```tsx
<PermissionGuard permission="inventory.view">
```

Buttons must respect permissions:

```text
Adjust Stock → inventory.adjust
Transfer Stock → inventory.transfer
Warehouse Create → warehouses.create
Warehouse Update → warehouses.update
```

Laravel must enforce authorization server-side too.

---

# 27. Database Transactions

Use transactions for operations that modify multiple related records.

### Stock Adjustment

```text
Adjustment
+
Adjustment Items
+
Stock Movement(s)
```

### Stock Transfer

```text
Transfer
+
Transfer Items
+
Source Movement(s)
+
Destination Movement(s)
```

If any required operation fails, the transaction should roll back.

---

# 28. Implementation Order

## Step 1 — Audit Existing Implementation

Inspect:

```text
Models
Migrations
Services
Requests
Controllers
Routes
Permissions
Frontend pages
Frontend API clients
```

Do not create files yet.

---

## Step 2 — Complete Warehouse Backend

Only if missing:

```text
Warehouse model
Warehouse service
Warehouse requests
Warehouse controller
Warehouse routes
Authorization
```

---

## Step 3 — Complete Warehouse Locations

Only if missing:

```text
Location model
Location service
Requests
Controller
Routes
Authorization
```

---

## Step 4 — Implement Centralized Stock Calculation

Only if missing.

The calculation must be reusable by:

```text
Inventory dashboard
Stock overview
Product stock
Low-stock detection
Warehouse stock
```

Do not duplicate SQL in multiple controllers.

---

## Step 5 — Stock Overview

Implement:

```text
stock by product
stock by warehouse
stock by location
low-stock detection
```

---

## Step 6 — Movement History

Implement:

```text
movement list
filters
pagination
product filter
warehouse filter
movement type filter
date filter
```

Only add filters that fit the existing architecture and beta scope.

---

## Step 7 — Stock Adjustments

Implement:

```text
Create adjustment
List adjustments
View adjustment
Adjustment items
Stock movement creation
Transactions
Permissions
```

---

## Step 8 — Stock Transfers

Implement:

```text
Create transfer
List transfers
View transfer
Process/complete transfer
Stock movement creation
Transactions
Permissions
```

---

## Step 9 — Inventory Dashboard

Build the dashboard after the stock calculation and underlying operations are working.

Do not build independent dashboard calculations.

---

# 29. Testing Strategy

Test the backend/API before relying on the frontend.

## Company isolation

Create/test data for:

```text
Company 7
Company 8
```

Verify Company 7 cannot access Company 8 inventory.

## Warehouse

Test:

```text
Create
Read
Update
Deactivate
```

## Stock

Test:

```text
Product with no movement → 0
IN movement → stock increases
OUT movement → stock decreases
Multiple movements → correct total
Warehouse filtering → correct stock
```

## Adjustment

Example:

```text
Initial stock = 100
Actual count = 90
Difference = -10
```

Verify:

```text
Adjustment created
Adjustment item created
Stock movement created
Final stock = 90
```

## Transfer

Example:

```text
Warehouse A = 100
Warehouse B = 20

Transfer 30 A → B
```

Expected:

```text
Warehouse A = 70
Warehouse B = 50
```

Verify the correct stock movements are recorded.

---

# 30. Frontend Testing

Verify:

```text
Inventory page loads
Warehouse filter works
Stock values are correct
Movement history works
Adjustment form works
Transfer form works
Permission guards work
Loading states work
Errors are displayed
Success messages work
```

Also verify that the frontend does not send trusted ownership fields such as:

```text
company_id
created_by
```

unless the existing API specifically requires them.

The backend should derive ownership from the authenticated user.

---

# 31. Definition of Done

Inventory is complete for beta only when:

- [ ] Existing inventory schema has been inspected
- [ ] No duplicate inventory migrations were created
- [ ] No duplicate models/services/routes were created
- [ ] Warehouse management works
- [ ] Warehouse locations work if included in the existing scope
- [ ] Stock calculation is centralized
- [ ] Stock overview works
- [ ] Movement history works
- [ ] Stock adjustments work
- [ ] Stock transfers work
- [ ] Company isolation works
- [ ] Permissions are enforced
- [ ] API validation works
- [ ] Database transactions protect multi-record operations
- [ ] Frontend loading/error/success states work
- [ ] API endpoints work in Postman
- [ ] Frontend works against the API
- [ ] Existing Product CRUD remains working
- [ ] Existing Customer CRUD remains working
- [ ] No unnecessary migration was introduced

---

# 32. Explicit Anti-Patterns

DO NOT:

```text
❌ Create a new inventories table without proving it is required
❌ Add stock directly to products without architectural justification
❌ Duplicate stock calculation logic
❌ Put business logic in routes
❌ Put business logic directly in controllers
❌ Trust company_id from the frontend
❌ Allow cross-company warehouse access
❌ Create duplicate permissions
❌ Create duplicate API routes
❌ Create duplicate frontend API clients
❌ Rewrite working Product CRUD
❌ Rewrite working Customer CRUD
❌ Introduce a second architecture
❌ Replace the existing Clean Architecture
❌ Create a migration merely because this document mentions a feature
```

---

# 33. Final Implementation Principle

The goal is NOT:

> "Build an inventory system from scratch."

The goal is:

> **"Complete the Inventory Management feature using the inventory architecture that already exists in BizFlow."**

The existing database already contains:

```text
Warehouses
Locations
Stock Movements
Stock Adjustments
Stock Adjustment Items
Stock Transfers
Stock Transfer Items
```

Therefore the agent must first discover what is already implemented and then fill only the missing pieces.

## Golden Rule

```text
EXISTS
  ↓
REUSE / EXTEND

MISSING
  ↓
IMPLEMENT

DATABASE CONCEPT MISSING
  ↓
ONLY THEN CREATE MIGRATION
```

Do not create anything merely because this specification mentions it.

**The actual repository is the source of truth.**
