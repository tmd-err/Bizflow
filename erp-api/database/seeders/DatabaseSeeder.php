<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $id = DB::table('companies')->insertGetId([
            'name' => 'Demo Company',
            'legal_name' => 'Demo Company SARL',
            'email' => 'contact@example.com',
            'phone' => '+212600000000',
            'address' => '123 Main Street',
            'city' => 'Casablanca',
            'country' => 'Morocco',
            'tax_number' => '123456789',
            'currency' => 'MAD',
            'timezone' => 'Africa/Casablanca',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['companies'] = [$id];

        $id = DB::table('company_settings')->insertGetId([
            'company_id' => $ids['companies'][0],
            'invoice_prefix' => 'INV',
            'quotation_prefix' => 'QUO',
            'order_prefix' => 'ORD',
            'purchase_prefix' => 'PO',
            'invoice_next_number' => 1,
            'quotation_next_number' => 1,
            'order_next_number' => 1,
            'purchase_next_number' => 1,
            'default_tax_rate' => 20.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['company_settings'] = [$id];

        $id = DB::table('departments')->insertGetId([
            'company_id' => $ids['companies'][0],
            'name' => 'Sales',
            'description' => 'Sample description.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['departments'] = [$id];

        $id = DB::table('expense_categories')->insertGetId([
            'company_id' => $ids['companies'][0],
            'name' => 'Office',
            'description' => 'Sample description.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['expense_categories'] = [$id];

        $id = DB::table('permissions')->insertGetId([
            'name' => 'view_dashboard',
            'description' => 'Sample description.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['permissions'] = [$id];

        $id = DB::table('product_brands')->insertGetId([
            'company_id' => $ids['companies'][0],
            'name' => 'Generic',
            'description' => 'Sample description.',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['product_brands'] = [$id];

        $id = DB::table('product_categories')->insertGetId([
            'company_id' => $ids['companies'][0],
            'name' => 'General',
            'description' => 'Sample description.',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['product_categories'] = [$id];

        $id = DB::table('products')->insertGetId([
            'company_id' => $ids['companies'][0],
            'category_id' => $ids['product_categories'][0],
            'brand_id' => $ids['product_brands'][0],
            'sku' => 'PROD-001',
            'name' => 'Sample Product',
            'description' => 'Sample description.',
            'type' => 'product',
            'barcode' => '1234567890123',
            'unit' => 'unit',
            'cost_price' => 0,
            'selling_price' => 0,
            'minimum_stock' => 0,
            'maximum_stock' => 100,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['products'] = [$id];

        $id = DB::table('product_prices')->insertGetId([
            'product_id' => $ids['products'][0],
            'name' => 'Default',
            'price' => 100.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['product_prices'] = [$id];

        $id = DB::table('product_variants')->insertGetId([
            'product_id' => $ids['products'][0],
            'sku' => 'PROD-001-V1',
            'name' => 'Standard',
            'attributes' => json_encode(['color' => 'red', 'size' => 'M']),
            'cost_price' => 80.0,
            'selling_price' => 120.0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['product_variants'] = [$id];

        $id = DB::table('purchase_request_items')->insertGetId([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['purchase_request_items'] = [$id];

        $id = DB::table('purchase_requests')->insertGetId([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['purchase_requests'] = [$id];

        $id = DB::table('role_user')->insertGetId([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['role_user'] = [$id];

        $id = DB::table('roles')->insertGetId([
            'company_id' => $ids['companies'][0],
            'name' => 'admin',
            'description' => 'Sample description.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['roles'] = [$id];

        $id = DB::table('permission_role')->insertGetId([
            'permission_id' => $ids['permissions'][0],
            'role_id' => $ids['roles'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['permission_role'] = [$id];

        $id = DB::table('suppliers')->insertGetId([
            'company_id' => $ids['companies'][0],
            'code' => 'Value',
            'name' => 'Supplier SARL',
            'email' => 'supplier@example.com',
            'phone' => '+212600000000',
            'tax_number' => '123456789',
            'payment_terms' => 0,
            'is_active' => true,
            'notes' => 'Initial notes.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['suppliers'] = [$id];

        $id = DB::table('supplier_addresses')->insertGetId([
            'supplier_id' => $ids['suppliers'][0],
            'type' => 'billing',
            'address' => '123 Main Street',
            'city' => 'Casablanca',
            'country' => 'Morocco',
            'is_default' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['supplier_addresses'] = [$id];

        $id = DB::table('supplier_contacts')->insertGetId([
            'supplier_id' => $ids['suppliers'][0],
            'name' => 'Sample name',
            'position' => 'Manager',
            'phone' => '+212600000000',
            'is_primary' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['supplier_contacts'] = [$id];

        $id = DB::table('users')->insertGetId([
            'name' => 'Sample name',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['users'] = [$id];

        $id = DB::table('audit_logs')->insertGetId([
            'company_id' => $ids['companies'][0],
            'user_id' => $ids['users'][0],
            'action' => 'created',
            'auditable_type' => 'Value',
            'auditable_id' => 1,
            'old_values' => json_encode([]),
            'new_values' => json_encode([]),
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['audit_logs'] = [$id];

        $id = DB::table('customers')->insertGetId([
            'role_id' => $ids['roles'][0],
            'user_id' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['customers'] = [$id];

        $id = DB::table('customer_addresses')->insertGetId([
            'customer_id' => $ids['customers'][0],
            'type' => 'billing',
            'address' => '123 Main Street',
            'city' => 'Casablanca',
            'country' => 'Morocco',
            'is_default' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['customer_addresses'] = [$id];

        $id = DB::table('customer_contacts')->insertGetId([
            'customer_id' => $ids['customers'][0],
            'name' => 'Sample name',
            'position' => 'Manager',
            'phone' => '+212600000000',
            'is_primary' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['customer_contacts'] = [$id];

        $id = DB::table('documents')->insertGetId([
            'company_id' => $ids['companies'][0],
            'documentable_type' => 'Value',
            'documentable_id' => 1,
            'name' => 'Contract',
            'path' => 'Value',
            'uploaded_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['documents'] = [$id];

        $id = DB::table('employees')->insertGetId([
            'company_id' => $ids['companies'][0],
            'department_id' => $ids['departments'][0],
            'user_id' => $ids['users'][0],
            'employee_number' => 'EMP-001',
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => 'employee@example.com',
            'phone' => '+212600000000',
            'hire_date' => '\'2026-01-01\'',
            'position' => 'Manager',
            'salary' => 5000.0,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['employees'] = [$id];

        $id = DB::table('attendance')->insertGetId([
            'employee_id' => $ids['employees'][0],
            'date' => now()->toDateString(),
            'check_in' => now(),
            'check_out' => now()->addHours(8),
            'status' => 'present',
            'notes' => 'Initial notes.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['attendance'] = [$id];

        $id = DB::table('expenses')->insertGetId([
            'company_id' => $ids['companies'][0],
            'category_id' => $ids['expense_categories'][0],
            'supplier_id' => $ids['suppliers'][0],
            'reference' => 'REF-0001',
            'amount' => 120.0,
            'date' => now()->toDateString(),
            'payment_method' => 'cash',
            'description' => 'Sample description.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['expenses'] = [$id];

        $id = DB::table('leave_requests')->insertGetId([
            'employee_id' => $ids['employees'][0],
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'type' => 'vacation',
            'status' => 'pending',
            'reason' => 'Initial adjustment',
            'approved_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['leave_requests'] = [$id];

        $id = DB::table('purchase_orders')->insertGetId([
            'company_id' => $ids['companies'][0],
            'supplier_id' => $ids['suppliers'][0],
            'number' => 'PO-0001',
            'date' => now()->toDateString(),
            'expected_date' => now()->toDateString(),
            'status' => 'draft',
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'total' => 0,
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['purchase_orders'] = [$id];

        $id = DB::table('purchase_order_items')->insertGetId([
            'purchase_order_id' => $ids['purchase_orders'][0],
            'product_id' => $ids['products'][0],
            'quantity' => 1,
            'unit_price' => 100.0,
            'discount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 120.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['purchase_order_items'] = [$id];

        $id = DB::table('quotations')->insertGetId([
            'company_id' => $ids['companies'][0],
            'customer_id' => $ids['customers'][0],
            'number' => 'Q-0001',
            'date' => now()->toDateString(),
            'valid_until' => now()->addDays(30)->toDateString(),
            'status' => 'draft',
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'total' => 0,
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['quotations'] = [$id];

        $id = DB::table('quotation_items')->insertGetId([
            'quotation_id' => $ids['quotations'][0],
            'product_id' => $ids['products'][0],
            'quantity' => 1,
            'unit_price' => 100.0,
            'discount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 120.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['quotation_items'] = [$id];

        $id = DB::table('sales_orders')->insertGetId([
            'company_id' => $ids['companies'][0],
            'customer_id' => $ids['customers'][0],
            'quotation_id' => $ids['quotations'][0],
            'number' => 'SO-0001',
            'date' => now()->toDateString(),
            'status' => 'draft',
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'total' => 0,
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['sales_orders'] = [$id];

        $id = DB::table('invoices')->insertGetId([
            'company_id' => $ids['companies'][0],
            'customer_id' => $ids['customers'][0],
            'sales_order_id' => $ids['sales_orders'][0],
            'number' => 'INV-0001',
            'date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'status' => 'draft',
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'total' => 0,
            'paid_amount' => 0,
            'remaining_amount' => 0,
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['invoices'] = [$id];

        $id = DB::table('invoice_items')->insertGetId([
            'invoice_id' => $ids['invoices'][0],
            'product_id' => $ids['products'][0],
            'description' => 'Sample description.',
            'quantity' => 1,
            'unit_price' => 100.0,
            'discount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 120.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['invoice_items'] = [$id];

        $id = DB::table('payments')->insertGetId([
            'company_id' => $ids['companies'][0],
            'customer_id' => $ids['customers'][0],
            'invoice_id' => $ids['invoices'][0],
            'reference' => 'REF-0001',
            'amount' => 120.0,
            'method' => 'cash',
            'date' => now()->toDateString(),
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['payments'] = [$id];

        $id = DB::table('sales_order_items')->insertGetId([
            'sales_order_id' => $ids['sales_orders'][0],
            'product_id' => $ids['products'][0],
            'quantity' => 1,
            'unit_price' => 100.0,
            'discount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => 120.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['sales_order_items'] = [$id];

        $id = DB::table('supplier_invoices')->insertGetId([
            'company_id' => $ids['companies'][0],
            'supplier_id' => $ids['suppliers'][0],
            'purchase_order_id' => $ids['purchase_orders'][0],
            'number' => 'SI-0001',
            'date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'status' => 'pending',
            'subtotal' => 0,
            'tax' => 0,
            'total' => 0,
            'paid_amount' => 0,
            'remaining_amount' => 0,
            'notes' => 'Initial notes.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['supplier_invoices'] = [$id];

        $id = DB::table('warehouses')->insertGetId([
            'company_id' => $ids['companies'][0],
            'code' => 'Value',
            'name' => 'Main Warehouse',
            'address' => '123 Main Street',
            'city' => 'Casablanca',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['warehouses'] = [$id];

        $id = DB::table('deliveries')->insertGetId([
            'company_id' => $ids['companies'][0],
            'sales_order_id' => $ids['sales_orders'][0],
            'warehouse_id' => $ids['warehouses'][0],
            'number' => 'D-0001',
            'date' => now()->toDateString(),
            'status' => 'pending',
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['deliveries'] = [$id];

        $id = DB::table('delivery_items')->insertGetId([
            'delivery_id' => $ids['deliveries'][0],
            'product_id' => $ids['products'][0],
            'quantity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['delivery_items'] = [$id];

        $id = DB::table('goods_receipts')->insertGetId([
            'company_id' => $ids['companies'][0],
            'purchase_order_id' => $ids['purchase_orders'][0],
            'warehouse_id' => $ids['warehouses'][0],
            'number' => 'GR-0001',
            'date' => now()->toDateString(),
            'status' => 'pending',
            'notes' => 'Initial notes.',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['goods_receipts'] = [$id];

        $id = DB::table('goods_receipt_items')->insertGetId([
            'goods_receipt_id' => $ids['goods_receipts'][0],
            'product_id' => $ids['products'][0],
            'ordered_quantity' => 1,
            'received_quantity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['goods_receipt_items'] = [$id];

        $id = DB::table('stock_adjustments')->insertGetId([
            'company_id' => $ids['companies'][0],
            'warehouse_id' => $ids['warehouses'][0],
            'reference' => 'REF-0001',
            'reason' => 'Initial adjustment',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['stock_adjustments'] = [$id];

        $id = DB::table('stock_adjustment_items')->insertGetId([
            'stock_adjustment_id' => $ids['stock_adjustments'][0],
            'product_id' => $ids['products'][0],
            'system_quantity' => 1,
            'actual_quantity' => 1,
            'difference' => 0.0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['stock_adjustment_items'] = [$id];

        $id = DB::table('stock_transfers')->insertGetId([
            'company_id' => $ids['companies'][0],
            'from_warehouse_id' => $ids['warehouses'][0],
            'to_warehouse_id' => $ids['warehouses'][0],
            'reference' => 'REF-0001',
            'status' => 'draft',
            'created_by' => $ids['users'][0],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['stock_transfers'] = [$id];

        $id = DB::table('stock_transfer_items')->insertGetId([
            'stock_transfer_id' => $ids['stock_transfers'][0],
            'product_id' => $ids['products'][0],
            'quantity' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['stock_transfer_items'] = [$id];

        $id = DB::table('warehouse_locations')->insertGetId([
            'warehouse_id' => $ids['warehouses'][0],
            'code' => 'Value',
            'name' => 'Zone A',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['warehouse_locations'] = [$id];

        $id = DB::table('stock_movements')->insertGetId([
            'company_id' => $ids['companies'][0],
            'product_id' => $ids['products'][0],
            'warehouse_id' => $ids['warehouses'][0],
            'location_id' => $ids['warehouse_locations'][0],
            'type' => 'in',
            'quantity' => 1,
            'unit_cost' => 50.0,
            'reference_type' => 'sales_order',
            'reference_id' => 1,
            'created_by' => $ids['users'][0],
            'notes' => 'Initial notes.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $ids['stock_movements'] = [$id];

    }
}