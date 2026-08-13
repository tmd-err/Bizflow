<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\PermissionSeeder;
use Illuminate\Support\Facades\DB;

class CompanyRoleSetupService
{
    /**
     * @var array<string, list<string>|string>
     */
    private const DEFAULT_ROLE_PERMISSIONS = [
        'Admin' => 'all',
        'Manager' => [
            'users.view',
            'users.create',
            'users.update',
            'products.view',
            'products.create',
            'products.update',
            'customers.view',
            'customers.create',
            'customers.update',
            'suppliers.view',
            'suppliers.create',
            'suppliers.update',
            'sales.view',
            'sales.create',
            'sales.update',
            'purchases.view',
            'purchases.create',
            'purchases.update',
        ],
        'Accountant' => [
            'customers.view',
            'sales.view',
            'sales.create',
            'sales.update',
            'purchases.view',
        ],
        'Employee' => [
            'products.view',
            'customers.view',
            'sales.view',
        ],
    ];

    /**
     * @return array<string, Role>
     */
    public function setupDefaultRoles(Company $company): array
    {
        return DB::transaction(function () use ($company) {
            $roles = [];

            foreach (self::DEFAULT_ROLE_PERMISSIONS as $name => $permissions) {
                $role = Role::create([
                    'company_id' => $company->id,
                    'name' => $name,
                    'description' => "Default {$name} role",
                ]);

                $permissionNames = $permissions === 'all'
                    ? PermissionSeeder::PERMISSIONS
                    : $permissions;

                $permissionIds = Permission::query()
                    ->whereIn('name', $permissionNames)
                    ->pluck('id');

                $role->permissions()->sync($permissionIds);

                $roles[$name] = $role;
            }

            return $roles;
        });
    }
}
