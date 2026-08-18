<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryReceiptItem extends Model
{
    protected $fillable = [
        'company_id',
        'delivery_receipt_id',
        'purchase_order_item_id',
        'product_id',
        'description',
        'ordered_qty',
        'received_qty',
        'unit',
    ];

    protected function casts(): array
    {
        return [
            'ordered_qty' => 'decimal:2',
            'received_qty' => 'decimal:2',
        ];
    }

    public function deliveryReceipt(): BelongsTo
    {
        return $this->belongsTo(DeliveryReceipt::class);
    }

    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}