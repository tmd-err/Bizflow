<?php

namespace App\Services;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

class PermissionService
{
    public function all(): Collection
    {
        return Permission::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);
    }
}
