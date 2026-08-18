<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity',
        'unit_price',
        'tax_rate',
        'tax_amount',
        'subtotal',
        'total',
        'received_quantity',
    ];

    protected function casts(): array
    {
        return [
            'quantity'           => 'decimal:2',
            'unit_price'         => 'decimal:2',
            'tax_rate'           => 'decimal:2',
            'tax_amount'         => 'decimal:2',
            'subtotal'           => 'decimal:2',
            'total'              => 'decimal:2',
            'received_quantity'  => 'decimal:2',
        ];
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}