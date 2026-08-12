<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'legal_name',
        'email',
        'phone',
        'tax_number',
        'address',
        'city',
        'country',
        'currency',
        'logo',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
