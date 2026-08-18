<?php

namespace App\Services;

use App\Models\DeliveryReceipt;
use App\Models\DeliveryReceiptItem;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DeliveryReceiptService
{
    /**
     * List delivery receipts for the user's company, eager-loaded.
     */
    public function listForCompany(\App\Models\User $user): array
    {
        $companyId = $user->company_id;

        return DeliveryReceipt::query()
            ->where('company_id', $companyId)
            ->with(['supplier', 'warehouse', 'purchaseOrder', 'creator'])
            ->orderByDesc('receipt_date')
            ->orderByDesc('id')
            ->get()
            ->map(function ($r) {
                $r->items_count = $r->items()->count();
                return $r;
            })
            ->all();
    }

    /**
     * Find a single receipt with all relations.
     */
    public function findForCompany(\App\Models\User $user, int $id): ?DeliveryReceipt
    {
        return DeliveryReceipt::query()
            ->where('company_id', $user->company_id)
            ->where('id', $id)
            ->with([
                'supplier',
                'warehouse',
                'purchaseOrder',
                'creator',
                'items.product',
                'items.purchaseOrderItem.product',
            ])
            ->firstOrFail();
    }

    /**
     * Create a delivery receipt and its items in a DB transaction.
     */
    public function create(\App\Models\User $user, array $data): DeliveryReceipt
    {
        $companyId = $user->company_id;

        // Validate PO if linked
        if (!empty($data['purchase_order_id'])) {
            $po = PurchaseOrder::where('company_id', $companyId)
                ->where('id', $data['purchase_order_id'])
                ->firstOrFail();
        }

        // Validate warehouse
        Warehouse::where('company_id', $companyId)
            ->where('id', $data['warehouse_id'])
            ->firstOrFail();

        return DB::transaction(function () use ($companyId, $user, $data) {
            $receipt = DeliveryReceipt::create([
                'company_id' => $companyId,
                'supplier_id' => $data['supplier_id'],
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'warehouse_id' => $data['warehouse_id'],
                'reference' => $data['reference'],
                'receipt_date' => $data['receipt_date'],
                'status' => 'received',
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            foreach ($data['items'] as $item) {
                // Verify product belongs to company
                Product::where('company_id', $companyId)
                    ->where('id', $item['product_id'])
                    ->firstOrFail();

                DeliveryReceiptItem::create([
                    'company_id' => $companyId,
                    'delivery_receipt_id' => $receipt->id,
                    'purchase_order_item_id' => $item['purchase_order_item_id'] ?? null,
                    'product_id' => $item['product_id'],
                    'description' => $item['description'] ?? null,
                    'ordered_qty' => $item['ordered_qty'] ?? 0,
                    'received_qty' => $item['received_qty'],
                    'unit' => $item['unit'] ?? null,
                ]);

                // Create stock movement
                StockMovement::create([
                    'company_id'    => $receipt->company_id,
                    'product_id'    => $item['product_id'],
                    'warehouse_id'  => $data['warehouse_id'],
                    'type'          => 'goods_receipt',
                    'quantity'      => $item['received_qty'],
                    'reference_type'=> DeliveryReceipt::class,
                    'reference_id'  => $receipt->id,
                    'created_by'    => $user->id,
                    'notes'         => "Delivery receipt {$receipt->reference}",
                ]);
            }

            return $receipt->load(['supplier', 'warehouse', 'items.product']);
        });
    }
}