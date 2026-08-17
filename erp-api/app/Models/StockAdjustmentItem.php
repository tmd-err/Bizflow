<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustmentItem extends Model
{
    protected $fillable = [
        'stock_adjustment_id',
        'product_id',
        'system_quantity',
        'actual_quantity',
        'difference',
    ];

    protected function casts(): array
    {
        return [
            'system_quantity' => 'decimal:3',
            'actual_quantity' => 'decimal:3',
            'difference' => 'decimal:3',
        ];
    }

    public function stockAdjustment(): BelongsTo
    {
        return $this->belongsTo(StockAdjustment::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}