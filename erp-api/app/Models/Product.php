<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $fillable = [
        'company_id',
        'category_id',
        'brand_id',
        'sku',
        'name',
        'description',
        'type',
        'barcode',
        'unit',
        'cost_price',
        'selling_price',
        'tax_rate',
        'minimum_stock',
        'maximum_stock',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'minimum_stock' => 'decimal:3',
            'maximum_stock' => 'decimal:3',
            'is_active' => 'boolean',
        ];
    }

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image
            ? Storage::disk('public')->url($this->image)
            : null;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
