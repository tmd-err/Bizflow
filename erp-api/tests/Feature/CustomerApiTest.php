<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use App\Services\CompanyRoleSetupService;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    private User $adminA;
    private User $employeeA;
    private User $adminB;
    private Company $companyA;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $setup = app(CompanyRoleSetupService::class);
        $this->companyA = Company::create(['name' => 'Company A', 'currency' => 'USD']);
        $companyB = Company::create(['name' => 'Company B', 'currency' => 'USD']);
        $rolesA = $setup->setupDefaultRoles($this->companyA);
        $rolesB = $setup->setupDefaultRoles($companyB);
        $this->adminA = User::factory()->create(['company_id' => $this->companyA->id]);
        $this->adminA->roles()->attach($rolesA['Admin']);
        $this->employeeA = User::factory()->create(['company_id' => $this->companyA->id]);
        $this->employeeA->roles()->attach($rolesA['Employee']);
        $this->adminB = User::factory()->create(['company_id' => $companyB->id]);
        $this->adminB->roles()->attach($rolesB['Admin']);
    }

    public function test_customer_crud_for_an_authorized_company_user(): void
    {
        Sanctum::actingAs($this->adminA);
        $created = $this->postJson('/api/customers', ['name' => 'Acme Corp', 'email' => 'accounts@acme.test', 'city' => 'Casablanca'])->assertCreated()->json('customer');
        $this->getJson('/api/customers')->assertOk()->assertJsonCount(1, 'customers');
        $this->getJson("/api/customers/{$created['id']}")->assertOk()->assertJsonPath('customer.name', 'Acme Corp');
        $this->patchJson("/api/customers/{$created['id']}", ['name' => 'Acme Morocco', 'email' => 'accounts@acme.test', 'is_active' => false])->assertOk()->assertJsonPath('customer.is_active', false);
        $this->deleteJson("/api/customers/{$created['id']}")->assertOk();
        $this->assertDatabaseMissing('customers', ['id' => $created['id']]);
    }

    public function test_customer_validation_and_permissions_are_enforced(): void
    {
        $this->postJson('/api/customers', [])->assertUnauthorized();
        Sanctum::actingAs($this->employeeA);
        $this->postJson('/api/customers', ['name' => 'Acme'])->assertForbidden();
        Sanctum::actingAs($this->adminA);
        $this->postJson('/api/customers', ['name' => '', 'email' => 'invalid'])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email']);
    }

    public function test_customers_are_isolated_between_companies(): void
    {
        $customer = Customer::create(['company_id' => $this->companyA->id, 'name' => 'Private Customer']);
        Sanctum::actingAs($this->adminB);
        $this->getJson('/api/customers')->assertOk()->assertJsonCount(0, 'customers');
        $this->getJson("/api/customers/{$customer->id}")->assertNotFound();
        $this->patchJson("/api/customers/{$customer->id}", ['name' => 'Hacked'])->assertNotFound();
        $this->deleteJson("/api/customers/{$customer->id}")->assertNotFound();
    }

    public function test_customer_with_quotations_cannot_be_deleted(): void
    {
        $customer = Customer::create(['company_id' => $this->companyA->id, 'name' => 'Historical Customer']);
        \Illuminate\Support\Facades\DB::table('quotations')->insert([
            'company_id' => $this->companyA->id,
            'customer_id' => $customer->id,
            'number' => 'QUO-001',
            'date' => now()->toDateString(),
            'status' => 'draft',
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'total' => 0,
            'created_by' => $this->adminA->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($this->adminA);

        $this->deleteJson("/api/customers/{$customer->id}")
            ->assertConflict();
    }
}
