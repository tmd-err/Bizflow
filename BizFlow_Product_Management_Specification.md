# BizFlow ERP — Product Management Feature Specification

## 1. Objective

Implement the complete **Product Management** module for BizFlow ERP.

The module must follow the architecture already used for:

- Authentication
- Company isolation
- Roles & permissions
- User management
- Customer management

Do not redesign existing architecture unless a real incompatibility is discovered.

The goal is a production-ready Product CRUD API and frontend with validation, permissions, company scoping, pagination, search/filtering, and clean error handling.

---

## 2. First: Inspect Before Coding

Before changing anything:

1. Inspect the existing Laravel structure.
2. Inspect the existing `products` migration, if present.
3. Inspect existing Product/Company/User models.
4. Inspect Customer controller, requests, resources/services, routes, and tests.
5. Inspect the existing permission middleware.
6. Inspect how company isolation is implemented for Customers.
7. Inspect the frontend Customer pages/components.
8. Inspect the shared Axios/API client.
9. Reuse established project conventions.

Do not create duplicate architecture.

If Customers use `FormRequest -> Controller -> Resource`, follow that pattern for Products. If the project uses services/actions, follow those conventions.

---

# 3. Database

## 3.1 Existing migration

If a `products` table already exists, inspect it first.

Do not create a duplicate table.

If it is incomplete, create a **new migration** to modify the already-run schema. Do not edit old migrations that have already been executed.

## 3.2 Target product structure

The target structure should approximately be:

```text
products
├── id
├── company_id
├── sku
├── name
├── description
├── unit
├── purchase_price
├── selling_price
├── tax_rate
├── is_active
├── created_at
└── updated_at
```

Only add `category_id` if the project already has a Categories module/table. Do not create Categories as part of this task.

### company_id

Must reference `companies.id`.

Recommended:

```php
$table->foreignId('company_id')
    ->constrained()
    ->cascadeOnDelete();
```

### sku

Required string.

SKU must be unique **within a company**, not globally.

Recommended database constraint:

```php
$table->unique(['company_id', 'sku']);
```

This means:

```text
Company A → SKU-001  OK
Company B → SKU-001  OK

Company A → SKU-001
Company A → SKU-001  NOT OK
```

### name

Required string.

### description

Nullable text.

### unit

Required string.

Examples:

```text
piece
kg
liter
box
hour
meter
```

### purchase_price

Decimal, non-negative:

```php
$table->decimal('purchase_price', 15, 2)->default(0);
```

### selling_price

Decimal, non-negative:

```php
$table->decimal('selling_price', 15, 2)->default(0);
```

### tax_rate

Percentage between 0 and 100:

```php
$table->decimal('tax_rate', 5, 2)->default(0);
```

### is_active

Boolean, default `true`.

Products should be able to be deactivated without necessarily deleting historical business data.

---

# 4. Company Isolation

Every product operation must be scoped to the authenticated user's company.

Use:

```php
$user->company_id
```

Never trust a frontend-supplied `company_id`.

For example, do not simply do:

```php
Product::findOrFail($id);
```

for company-scoped endpoints.

Use the established project pattern, for example:

```php
Product::where('company_id', $user->company_id)
    ->findOrFail($id);
```

Apply company scoping to:

- Index
- Show
- Create
- Update
- Delete

A user from Company 7 must never read or modify a Product from Company 8.

---

# 5. Delete Strategy

Before implementing deletion, inspect whether Products are already referenced by other tables.

Potential future references include:

- quotation_items
- invoice_items
- order_items
- stock_movements
- purchase_items

Respect existing foreign-key constraints.

If the current schema/business rules require products to remain for historical records, prefer deactivation using:

```text
is_active = false
```

Do not introduce SoftDeletes unless the existing architecture already uses them or the database explicitly requires them.

Follow the current Customer/product conventions.

---

# 6. Permissions

Create/seed these permissions:

```text
products.view
products.create
products.update
products.delete
```

Descriptions:

```text
products.view   = View products
products.create = Create products
products.update = Update products
products.delete = Delete products
```

Do not hard-code permission IDs.

Use permission names.

---

# 7. API Routes

Follow the project's existing route conventions.

Expected routes:

```php
Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/products', [ProductController::class, 'index'])
        ->middleware('permission:products.view');

    Route::post('/products', [ProductController::class, 'store'])
        ->middleware('permission:products.create');

    Route::get('/products/{product}', [ProductController::class, 'show'])
        ->middleware('permission:products.view');

    Route::patch('/products/{product}', [ProductController::class, 'update'])
        ->middleware('permission:products.update');

    Route::delete('/products/{product}', [ProductController::class, 'destroy'])
        ->middleware('permission:products.delete');
});
```

Use `PATCH` if that is the existing update convention. Do not introduce PUT only for Products.

---

# 8. Controller

Create/update:

```text
ProductController
```

Expected methods:

```text
index()
store()
show()
update()
destroy()
```

Responsibilities:

### index

- Authenticate user
- Apply company scope
- Search
- Filter
- Paginate
- Return the existing API response format

### store

- Validate input
- Get company from authenticated user
- Create Product
- Never trust `company_id` from request
- Return Product

### show

- Retrieve company-scoped Product
- Return Product

### update

- Retrieve company-scoped Product
- Validate
- Update
- Return Product

### destroy

- Retrieve company-scoped Product
- Delete/deactivate according to project/database strategy
- Return success

Keep business logic in services/actions if the existing architecture uses them.

---

# 9. Validation

Use Form Requests if the existing Customer module uses them.

## Create

Recommended validation:

```text
sku:
required|string|max:100

name:
required|string|max:255

description:
nullable|string

unit:
required|string|max:50

purchase_price:
required|numeric|min:0

selling_price:
required|numeric|min:0

tax_rate:
nullable|numeric|min:0|max:100

is_active:
boolean
```

SKU uniqueness must be scoped to the authenticated user's company.

## Update

For PATCH semantics:

```text
sku:
sometimes|required|string|max:100

name:
sometimes|required|string|max:255

description:
nullable|string

unit:
sometimes|required|string|max:50

purchase_price:
sometimes|required|numeric|min:0

selling_price:
sometimes|required|numeric|min:0

tax_rate:
sometimes|numeric|min:0|max:100

is_active:
sometimes|boolean
```

SKU uniqueness must ignore the current Product while remaining company-scoped.

---

# 10. Model

Create/update:

```text
App\Models\Product
```

Follow project conventions for `$fillable`, casts, relationships, etc.

At minimum, the model should have:

```php
public function company()
{
    return $this->belongsTo(Company::class);
}
```

Do not add relationships to models/tables that do not exist.

---

# 11. API Endpoints

## GET /api/products

Permission:

```text
products.view
```

Return paginated products.

Support, where consistent with the existing API:

```text
?page=1
&per_page=15
&search=keyboard
&is_active=true
```

Search at minimum:

- SKU
- Name

Filter:

- Active/inactive

Do not return other companies' products.

## POST /api/products

Permission:

```text
products.create
```

Example:

```json
{
  "sku": "KB-001",
  "name": "Mechanical Keyboard",
  "description": "Mechanical keyboard with RGB lighting",
  "unit": "piece",
  "purchase_price": 450.00,
  "selling_price": 650.00,
  "tax_rate": 20,
  "is_active": true
}
```

`company_id` must be derived server-side.

## GET /api/products/{product}

Permission:

```text
products.view
```

Must be company-scoped.

## PATCH /api/products/{product}

Permission:

```text
products.update
```

Allow editable fields only.

Never allow the client to modify:

```text
id
company_id
created_at
updated_at
```

## DELETE /api/products/{product}

Permission:

```text
products.delete
```

Follow the project's established deletion/deactivation strategy.

---

# 12. API Response Format

Follow the existing Customer API response format.

Do not invent a new response structure.

If Customers use:

```json
{
  "message": "Customer updated successfully.",
  "customer": {}
}
```

Products should use the same convention:

```json
{
  "message": "Product updated successfully.",
  "product": {}
}
```

For lists, reuse the existing pagination/resource structure.

---

# 13. Frontend

Only start frontend implementation after the backend is implemented and tested.

Reuse the Customer Management architecture.

Expected UI:

```text
Products
├── Product list
├── Create product
├── Edit product
├── Product details
├── Delete/deactivate confirmation
├── Search
├── Filters
└── Pagination
```

Use the existing shared Axios/API client.

Do not create a second Axios client.

---

# 14. Product List

Display:

```text
SKU
Name
Unit
Purchase Price
Selling Price
Tax
Status
Actions
```

Actions must be permission-aware:

```text
products.view
products.update
products.delete
```

Frontend permission checks are UX only. Backend middleware remains the real security boundary.

---

# 15. Create Form

Fields:

```text
SKU
Name
Description
Unit
Purchase Price
Selling Price
Tax Rate
Active
```

Requirements:

- Reuse existing UI components
- Show validation errors
- Show API errors
- Prevent invalid numeric input
- Follow existing loading/submitting states
- Use existing notification/toast system

---

# 16. Edit Form

Reuse the Create form where appropriate.

Load existing Product.

Submit:

```text
PATCH /api/products/{id}
```

Handle:

- Success
- Validation errors
- 403
- 404
- Network errors

Do not manually implement CORS handling in the frontend.

---

# 17. Delete / Deactivate

Show confirmation.

On success:

- Update/remove the row
- Refresh list if necessary
- Show success notification

On `403`:

- Show permission error

---

# 18. Search / Filtering / Pagination

Follow the Customer API conventions.

Prefer server-side filtering if the existing API is server-side paginated.

Support:

```text
search
page
per_page
is_active
```

Do not load the entire product table into the browser just to filter it locally if the backend already supports server-side pagination.

---

# 19. Testing

## Database

Verify:

- Product can be created
- Duplicate SKU in same company is rejected
- Same SKU in different company is allowed
- Negative purchase price is rejected
- Negative selling price is rejected
- Tax below 0 is rejected
- Tax above 100 is rejected

## Permissions

Without `products.view`:

```text
GET /api/products
```

must return:

```text
403
```

Without `products.create`:

```text
POST /api/products
```

must return:

```text
403
```

Without `products.update`:

```text
PATCH /api/products/{id}
```

must return:

```text
403
```

Without `products.delete`:

```text
DELETE /api/products/{id}
```

must return:

```text
403
```

With each permission, the operation must succeed.

## Company isolation

Create:

```text
Company A → Product A
Company B → Product B
```

Authenticate as Company A.

Verify:

```text
GET /products
```

does not return Product B.

Also verify that Company A cannot:

```text
GET Product B
PATCH Product B
DELETE Product B
```

Use the project's established cross-company response behavior, preferably 404 rather than leaking resource existence.

---

# 20. API Test Order

Run tests in this order:

1. Verify permissions exist.
2. Assign permissions to a test role.
3. Create Product.
4. List Products.
5. Show Product.
6. Update Product.
7. Search Products.
8. Filter active/inactive Products.
9. Delete/deactivate Product.
10. Remove permissions and verify 403 responses.
11. Test company isolation.

Use Postman/Tinker where appropriate before debugging the frontend.

---

# 21. Implementation Order

Follow this sequence strictly:

```text
1. Inspect existing architecture
        ↓
2. Inspect existing products migration
        ↓
3. Complete database schema using a new migration if required
        ↓
4. Update/create Product model
        ↓
5. Add Product permissions
        ↓
6. Create validation requests
        ↓
7. Create Product controller/service
        ↓
8. Create API routes
        ↓
9. Test API with Postman/Tinker
        ↓
10. Test permissions
        ↓
11. Test company isolation
        ↓
12. Implement frontend API functions
        ↓
13. Implement Product list
        ↓
14. Implement Create form
        ↓
15. Implement Edit form
        ↓
16. Implement Delete/deactivate
        ↓
17. Implement search/filter/pagination
        ↓
18. Test frontend
        ↓
19. Fix regressions
        ↓
20. Final verification
```

Do not jump to frontend before backend authorization and CRUD are verified.

---

# 22. Important Rules

## Do NOT

- Modify authentication unnecessarily.
- Modify the existing RBAC architecture unnecessarily.
- Remove permission middleware.
- Trust `company_id` from the frontend.
- Allow cross-company access.
- Hard-code permission IDs.
- Create duplicate Axios clients.
- Create duplicate CORS middleware.
- Rewrite working Customer Management code.
- Edit already-run migrations instead of creating proper migrations.
- Add unnecessary dependencies.
- Implement Inventory, Quotations, Invoices, Sales, or Purchases in this task.

## DO

- Reuse existing architecture.
- Reuse Customer patterns.
- Use proper migrations.
- Reuse existing FormRequest/Resource/Service patterns.
- Reuse existing API response conventions.
- Reuse existing frontend components.
- Reuse the shared API client.
- Keep authorization on the backend.
- Keep company isolation on the backend.
- Test every endpoint.
- Keep the implementation focused on Products.

---

# 23. Definition of Done

```text
[ ] Product database structure exists
[ ] Product model works
[ ] Company relationship works
[ ] Product permissions exist
[ ] Product permissions are seedable
[ ] Product routes exist
[ ] Product index works
[ ] Product create works
[ ] Product show works
[ ] Product update works
[ ] Product delete/deactivate works
[ ] Validation works
[ ] SKU uniqueness works per company
[ ] Company isolation works
[ ] Permission middleware works
[ ] Pagination works
[ ] Search works
[ ] Active/inactive filtering works
[ ] Frontend product list works
[ ] Frontend create works
[ ] Frontend edit works
[ ] Frontend delete/deactivate works
[ ] Frontend permission-aware actions work
[ ] API tests pass
[ ] RBAC tests pass
[ ] Company isolation tests pass
[ ] Existing Customer/User/RBAC functionality still works
```

Only mark the feature COMPLETE after the applicable checks pass.

---

# 24. Final Agent Report

When finished, report:

```text
Product Management Implementation Report

Database:
- Files changed:
- Migrations:
- Final product columns:

Backend:
- Model:
- Controller:
- Requests:
- Resources/Services:
- Routes:

Permissions:
- products.view:
- products.create:
- products.update:
- products.delete:

Company isolation:
- Status:

API:
- Create:
- List:
- Show:
- Update:
- Delete:
- Search:
- Filtering:
- Pagination:

Frontend:
- Pages:
- Components:
- API functions:
- Forms:

Testing:
- CRUD:
- Validation:
- Permissions:
- Company isolation:
- Frontend:

Regressions:
- Existing functionality checked:
- Problems found:

Status:
COMPLETE / INCOMPLETE
```
