# BizFlow ERP — Purchasing Module Implementation Plan

## Goal

Build the **Purchasing module** from Laravel API to Next.js frontend.

### Critical rules

- First inspect the existing project.
- If a feature already exists, **reuse it. Do not recreate it**.
- Do not create duplicate migrations, models, APIs, components, or permissions.
- Follow the existing Clean Architecture.
- Business logic belongs in Services, not routes.
- Keep `company_id` isolation everywhere.
- Reuse the existing authentication and permission system.
- Reuse Shadcn UI, Tailwind, shared components, `apiGet/apiPost/apiPatch/apiDelete`, `PermissionGuard`, `hasPermission`, `useFormFeedback`, and `getApiErrorMessage`.
- Do not redesign working Inventory or Warehouse features.

---

# Phase 1 — Audit Existing Code

Before coding, inspect:

```text
app/Models/
app/Services/
app/Http/Controllers/
app/Http/Requests/
database/migrations/
database/seeders/
routes/
lib/api/
app/dashboard/
components/
```

Check whether these already exist:

- Supplier
- SupplierAddress
- SupplierContact
- PurchaseOrder
- PurchaseOrderItem
- PurchaseInvoice
- PurchaseInvoiceItem
- SupplierPayment
- GoodsReceipt / Receiving
- StockMovement
- Warehouse
- Product

If something exists, use and extend it instead of recreating it.

Also inspect the existing Inventory implementation because receiving goods must use it.

---

# Phase 2 — Suppliers

If Supplier CRUD already exists, do not recreate it.

Verify that suppliers support:

- company_id
- code
- name
- email
- phone
- address
- city
- country
- tax_number
- notes
- is_active

Also verify supplier addresses, contacts, company isolation, permissions, API, and frontend.

Complete only missing parts.

---

# Phase 3 — Purchase Orders Backend

If purchase orders do not exist, create them.

## Purchase order

Use the project's existing schema conventions. The resource should support:

```text
id
company_id
supplier_id
warehouse_id
reference
order_date
expected_date
status
subtotal
tax_amount
total
notes
created_by
created_at
updated_at
```

## Purchase order item

```text
id
purchase_order_id
product_id
quantity
unit_price
tax_rate
tax_amount
subtotal
total
```

Do not add unnecessary fields if the project already has an established schema.

## Status lifecycle

```text
draft
ordered
partially_received
received
cancelled
```

Respect valid status transitions.

---

# Phase 4 — Purchase Order API

Follow the existing API architecture:

```text
PurchaseOrderController
PurchaseOrderService
PurchaseOrderRequest(s)
```

Business logic must remain in the Service.

Expected endpoints:

```http
GET    /api/purchase-orders
POST   /api/purchase-orders
GET    /api/purchase-orders/{id}
PATCH  /api/purchase-orders/{id}
DELETE /api/purchase-orders/{id}
PATCH  /api/purchase-orders/{id}/order
PATCH  /api/purchase-orders/{id}/cancel
```

Follow existing project naming conventions if different.

Every operation must enforce company isolation.

A user must not be able to use another company's:

- supplier
- warehouse
- product
- purchase order

---

# Phase 5 — Purchase Order Business Logic

When creating a purchase order:

1. Verify the user belongs to a company.
2. Verify supplier belongs to that company.
3. Verify warehouse belongs to that company.
4. Verify every product belongs to that company.
5. Validate quantities.
6. Validate prices.
7. Calculate item subtotals.
8. Calculate tax.
9. Calculate order subtotal and total.
10. Create the order and items inside a database transaction.

Never trust totals sent by the frontend.

The backend must calculate financial totals.

---

# Phase 6 — Receiving / Goods Receipt

Receiving must integrate with the existing Inventory system.

Workflow:

```text
Purchase Order
      ↓
Ordered
      ↓
Receive goods
      ↓
Stock Movement
      ↓
Warehouse stock increases
```

For every received item, use the existing:

```text
StockMovement
InventoryService
Warehouse
Product
```

Do **not** create another inventory system.

## Partial receiving

Example:

```text
Ordered: 100
Received: 40
Remaining: 60
```

Status:

```text
partially_received
```

After receiving the remaining quantity:

```text
received
```

Do not allow receiving more than the ordered quantity unless the existing business rules explicitly support it.

---

# Phase 7 — Receiving API

Expected endpoint:

```http
POST /api/purchase-orders/{id}/receive
```

Example request:

```json
{
  "items": [
    {
      "purchase_order_item_id": 1,
      "quantity": 40
    }
  ]
}
```

Backend must:

1. Validate purchase order.
2. Validate company ownership.
3. Validate items.
4. Validate received quantities.
5. Create stock movements.
6. Update received quantities.
7. Update purchase order status.
8. Run everything inside a DB transaction.

If anything fails, roll back the transaction.

---

# Phase 8 — Purchase Invoices

Implement only after Purchase Orders and Receiving work.

Support:

```text
supplier
purchase_order
invoice_number
invoice_date
due_date
subtotal
tax_amount
total
status
notes
```

Statuses:

```text
unpaid
partially_paid
paid
cancelled
```

---

# Phase 9 — Supplier Payments

Implement after invoices.

Support:

```text
invoice
amount
payment_date
payment_method
reference
notes
created_by
```

Update invoice status automatically:

```text
paid = 0
→ unpaid

paid < total
→ partially_paid

paid = total
→ paid
```

Do not allow payments greater than the outstanding amount unless existing business rules support it.

---

# Phase 10 — Permissions

First inspect existing permissions.

Do not duplicate them.

Expected permissions may include:

```text
purchases.view
purchases.create
purchases.update
purchases.delete
purchases.order
purchases.receive
purchases.cancel
purchases.invoices.view
purchases.invoices.create
purchases.invoices.update
purchases.payments.view
purchases.payments.create
```

Use the project's existing naming convention if different.

---

# Phase 11 — Frontend API

Create/reuse:

```text
lib/api/purchase-orders.ts
lib/api/suppliers.ts
lib/api/purchase-invoices.ts
lib/api/supplier-payments.ts
```

Use the existing API client:

```text
apiGet
apiPost
apiPatch
apiDelete
```

Keep types strongly typed.

---

# Phase 12 — Purchase Orders Pages

Expected routes:

```text
/dashboard/purchases
/dashboard/purchases/new
/dashboard/purchases/[id]
/dashboard/purchases/[id]/edit
```

Follow the existing routing structure if different.

## List page

Header:

```text
Purchase Orders
Manage purchases from suppliers.
```

Action:

```text
+ New Purchase Order
```

Filters:

- Search
- Supplier
- Warehouse
- Status
- Date range

Table:

```text
Reference
Supplier
Warehouse
Order Date
Expected Date
Total
Status
Actions
```

Actions:

```text
View
Edit
Order
Cancel
```

---

# Phase 13 — Purchase Order Form UX

## General information

Fields:

```text
Supplier
Warehouse
Reference
Order Date
Expected Date
Notes
```

## Product lines

Dynamic table:

```text
Product
Quantity
Unit Price
Tax
Subtotal
Actions
```

Button:

```text
+ Add product
```

## Summary

Show:

```text
Subtotal
Tax
Total
```

The frontend can calculate values for UX, but the backend remains the source of truth.

---

# Phase 14 — Purchase Order Detail UX

Make it look like a professional ERP document.

Show:

```text
Purchase Order #PO-XXXX
Supplier
Status
Order date
Expected date
```

Actions depend on status and permissions:

```text
Edit
Mark as Ordered
Receive
Cancel
```

Sections:

### Supplier

Name, email, phone, address.

### Warehouse

Warehouse name and location.

### Items

```text
Product
SKU
Quantity
Unit Price
Tax
Subtotal
```

### Totals

```text
Subtotal
Tax
Total
```

### Status timeline

```text
Draft → Ordered → Partially Received → Received
```

Highlight the current status.

---

# Phase 15 — Receiving UI

Receiving should be a dedicated workflow.

Example:

```text
Receive Purchase Order

Product        Ordered    Received    Remaining    Receive Now
---------------------------------------------------------------
Product A        100         40           60           [20]
Product B         50          0           50           [50]
```

Show:

```text
Warehouse
Supplier
PO Reference
```

Before confirmation:

```text
You are about to add X units to Warehouse Y.
```

Button:

```text
Confirm Receipt
```

Success message:

```text
Goods received successfully.
Inventory has been updated.
```

---

# Phase 16 — Loading, Error, Empty States

Use existing project components.

Loading:

- existing skeleton/spinner

Empty:

```text
No purchase orders found.

Create your first purchase order to start purchasing from suppliers.
```

Errors:

Use:

```text
useFormFeedback
getApiErrorMessage
```

Do not create another notification system.

---

# Phase 17 — UI/UX Rules

Use:

```text
Tailwind CSS
Shadcn UI
Lucide icons
```

The UI must be:

- clean
- professional
- responsive
- consistent with Products and Inventory
- easy to scan
- suitable for a real ERP

Avoid:

- excessive animations
- huge cards
- unnecessary gradients
- clutter
- excessive colors
- oversized typography

Use consistent status badges.

Use confirmation dialogs for destructive actions.

---

# Phase 18 — Frontend Permissions

Use the existing:

```tsx
<PermissionGuard />
```

and:

```tsx
hasPermission()
```

Example:

```tsx
<PermissionGuard permission="purchases.view">
```

Buttons must also check permissions:

```tsx
hasPermission("purchases.receive")
```

Frontend permissions are only for UX. Backend authorization must still enforce security.

---

# Phase 19 — Testing

Test the complete workflow.

## Suppliers

- Create
- Update
- View
- Delete/deactivate

## Purchase Orders

- Create draft
- Edit draft
- Mark ordered
- View
- Cancel

## Receiving

- Partial receiving
- Remaining quantity
- Stock movement creation
- Warehouse stock increase
- Final receiving
- Status becomes `received`

## Security

Test different companies.

Verify users cannot access another company's:

- supplier
- warehouse
- product
- purchase order

## Financial calculations

Verify:

```text
subtotal
tax
total
```

Backend calculations must be correct.

---

# Implementation Order

Implement strictly in this order:

```text
1. Audit existing code
        ↓
2. Suppliers
        ↓
3. Purchase Order migrations/models
        ↓
4. Requests
        ↓
5. Service
        ↓
6. Controller/routes
        ↓
7. Permissions
        ↓
8. API testing
        ↓
9. Frontend API
        ↓
10. Purchase Order list
        ↓
11. Purchase Order form
        ↓
12. Purchase Order details
        ↓
13. Receiving backend
        ↓
14. Inventory integration
        ↓
15. Receiving frontend
        ↓
16. Purchase invoices
        ↓
17. Supplier payments
        ↓
18. Full testing
```

## Important

Do **not** build everything at once.

For every backend feature:

```text
Migration
→ Model
→ Request
→ Service
→ Controller
→ Route
→ Permission
→ API test
```

Then frontend:

```text
API client
→ Page
→ Form
→ Detail
→ Loading/Error/Empty states
→ PermissionGuard
→ Test
```

Only move to the next phase after the current phase works.

## Final workflow

BizFlow should eventually support:

```text
Supplier
   ↓
Purchase Order
   ↓
Ordered
   ↓
Receive Goods
   ↓
Stock Movement
   ↓
Warehouse Inventory increases
   ↓
Purchase Invoice
   ↓
Supplier Payment
```

Do not mark Purchasing complete until this workflow works end-to-end.
