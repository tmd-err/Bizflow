<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public const PERMISSIONS = [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',

        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',

        'permissions.view',

        'products.view',
        'products.create',
        'products.update',
        'products.delete',

        'customers.view',
        'customers.create',
        'customers.update',
        'customers.delete',

        'suppliers.view',
        'suppliers.create',
        'suppliers.update',
        'suppliers.delete',

        'sales.view',
        'sales.create',
        'sales.update',
        'sales.delete',

        'purchases.view',
        'purchases.create',
        'purchases.update',
        'purchases.delete',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $name) {
            Permission::updateOrCreate(
                ['name' => $name],
                ['description' => null]
            );
        }
    }
}
