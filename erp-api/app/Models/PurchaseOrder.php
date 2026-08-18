<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $fillable = [
        "company_id",
        "supplier_id",
        "warehouse_id",
        "reference",
        "order_date",
        "expected_date",
        "status",
        "subtotal",
        "tax_amount",
        "total",
        "notes",
        "created_by",
    ];

    protected function casts(): array
    {
        return [
            "subtotal"  => "decimal:2",
            "tax_amount"=> "decimal:2",
            "total"     => "decimal:2",
            "order_date"=> "date",
            "expected_date"=> "date",
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, "created_by");
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}