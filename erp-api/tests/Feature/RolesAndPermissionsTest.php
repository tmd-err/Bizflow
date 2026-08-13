<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\CompanyRoleSetupService;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    private Company $companyA;

    private Company $companyB;

    private User $adminA;

    private User $employeeA;

    private Role $adminRoleA;

    private Role $adminRoleB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionSeeder::class);

        $setup = app(CompanyRoleSetupService::class);

        $this->companyA = Company::create([
            'name' => 'Company A',
            'currency' => 'USD',
        ]);
        $this->companyB = Company::create([
            'name' => 'Company B',
            'currency' => 'USD',
        ]);

        $rolesA = $setup->setupDefaultRoles($this->companyA);
        $rolesB = $setup->setupDefaultRoles($this->companyB);

        $this->adminRoleA = $rolesA['Admin'];
        $this->adminRoleB = $rolesB['Admin'];

        $this->adminA = User::create([
            'name' => 'Admin A',
            'email' => 'admin-a@example.com',
            'password' => Hash::make('password'),
            'company_id' => $this->companyA->id,
        ]);
        $this->adminA->roles()->attach($this->adminRoleA);

        $this->employeeA = User::create([
            'name' => 'Employee A',
            'email' => 'employee-a@example.com',
            'password' => Hash::make('password'),
            'company_id' => $this->companyA->id,
        ]);
        $this->employeeA->roles()->attach($rolesA['Employee']);
    }

    public function test_unauthenticated_user_cannot_access_roles(): void
    {
        $this->getJson('/api/roles')->assertUnauthorized();
    }

    public function test_me_returns_user_roles_and_permissions(): void
    {
        Sanctum::actingAs($this->adminA);

        $response = $this->getJson('/api/me');

        $response->assertOk()
            ->assertJsonPath('user.email', 'admin-a@example.com')
            ->assertJsonStructure([
                'user',
                'company',
                'roles',
                'permissions',
            ]);

        $permissions = $response->json('permissions');
        $this->assertContains('roles.view', $permissions);
        $this->assertContains('products.create', $permissions);
    }

    public function test_user_with_permission_can_list_roles(): void
    {
        Sanctum::actingAs($this->adminA);

        $this->getJson('/api/roles')
            ->assertOk()
            ->assertJsonCount(4, 'roles');
    }

    public function test_user_without_permission_cannot_list_roles(): void
    {
        Sanctum::actingAs($this->employeeA);

        $this->getJson('/api/roles')->assertForbidden();
    }

    public function test_user_with_permission_can_create_role(): void
    {
        Sanctum::actingAs($this->adminA);

        $this->postJson('/api/roles', [
            'name' => 'Sales Manager',
            'description' => 'Manages sales',
        ])->assertCreated()
            ->assertJsonPath('role.name', 'Sales Manager');
    }

    public function test_user_with_permission_can_create_a_company_user_with_roles(): void
    {
        Sanctum::actingAs($this->adminA);

        $this->postJson('/api/users', [
            'name' => 'New Employee',
            'email' => 'new-employee@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [$this->adminRoleA->id],
        ])->assertCreated()
            ->assertJsonPath('user.name', 'New Employee')
            ->assertJsonPath('user.company_id', $this->companyA->id)
            ->assertJsonPath('user.roles.0.id', $this->adminRoleA->id);

        $this->assertDatabaseHas('users', [
            'email' => 'new-employee@example.com',
            'company_id' => $this->companyA->id,
        ]);
    }

    public function test_user_creation_cannot_assign_a_role_from_another_company(): void
    {
        Sanctum::actingAs($this->adminA);

        $this->postJson('/api/users', [
            'name' => 'New Employee',
            'email' => 'new-employee@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_ids' => [$this->adminRoleB->id],
        ])->assertUnprocessable();
    }

    public function test_cross_company_role_modification_is_forbidden(): void
    {
        Sanctum::actingAs($this->adminA);

        $this->patchJson("/api/roles/{$this->adminRoleB->id}", [
            'name' => 'Hacked',
        ])->assertForbidden();
    }

    public function test_cross_company_role_assignment_is_forbidden(): void
    {
        Sanctum::actingAs($this->adminA);

        $target = User::create([
            'name' => 'User A',
            'email' => 'user-a@example.com',
            'password' => Hash::make('password'),
            'company_id' => $this->companyA->id,
        ]);

        $this->postJson("/api/users/{$target->id}/roles", [
            'role_id' => $this->adminRoleB->id,
        ])->assertUnprocessable();
    }

    public function test_duplicate_role_assignment_does_not_create_duplicate_pivot(): void
    {
        Sanctum::actingAs($this->adminA);

        $target = User::create([
            'name' => 'User A',
            'email' => 'user-a@example.com',
            'password' => Hash::make('password'),
            'company_id' => $this->companyA->id,
        ]);

        $this->postJson("/api/users/{$target->id}/roles", [
            'role_id' => $this->adminRoleA->id,
        ])->assertCreated();

        $this->postJson("/api/users/{$target->id}/roles", [
            'role_id' => $this->adminRoleA->id,
        ])->assertCreated();

        $this->assertSame(1, $target->roles()->count());
    }

    public function test_user_with_multiple_roles_receives_union_of_permissions(): void
    {
        $managerRole = Role::query()
            ->where('company_id', $this->companyA->id)
            ->where('name', 'Manager')
            ->firstOrFail();

        $accountantRole = Role::query()
            ->where('company_id', $this->companyA->id)
            ->where('name', 'Accountant')
            ->firstOrFail();

        $user = User::create([
            'name' => 'Multi Role',
            'email' => 'multi@example.com',
            'password' => Hash::make('password'),
            'company_id' => $this->companyA->id,
        ]);

        $user->roles()->attach([$managerRole->id, $accountantRole->id]);

        $permissions = $user->getPermissionNames();

        $this->assertTrue($permissions->contains('products.view'));
        $this->assertTrue($permissions->contains('sales.create'));
    }

    public function test_company_creation_assigns_admin_role_to_creator(): void
    {
        $user = User::create([
            'name' => 'New Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/company', [
            'name' => 'New Co',
            'currency' => 'USD',
        ])->assertCreated();

        $user->refresh();

        $this->assertNotNull($user->company_id);
        $this->assertTrue($user->hasRole('Admin'));
        $this->assertTrue($user->hasPermission('roles.view'));
    }
}
