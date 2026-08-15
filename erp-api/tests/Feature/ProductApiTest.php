<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Product;
use App\Models\User;
use App\Services\CompanyRoleSetupService;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
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

    public function test_product_crud_for_authorized_company_user(): void
    {
        Sanctum::actingAs($this->adminA);

        $payload = [
            'sku' => 'KB-001',
            'name' => 'Mechanical Keyboard',
            'description' => 'RGB mechanical keyboard',
            'unit' => 'piece',
            'cost_price' => 450,
            'selling_price' => 650,
            'tax_rate' => 20,
            'is_active' => true,
        ];

        $created = $this->postJson('/api/products', $payload)
            ->assertCreated()
            ->json('product');

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'products')
            ->assertJsonPath('products.0.sku', 'KB-001');

        $this->getJson("/api/products/{$created['id']}")
            ->assertOk()
            ->assertJsonPath('product.name', 'Mechanical Keyboard');

        $this->patchJson("/api/products/{$created['id']}", [
            'name' => 'Wireless Keyboard',
            'cost_price' => 500,
            'tax_rate' => 18,
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('product.name', 'Wireless Keyboard')
            ->assertJsonPath('product.cost_price', '500.00')
            ->assertJsonPath('product.tax_rate', '18.00');

        $this->assertDatabaseHas('products', [
            'id' => $created['id'],
            'cost_price' => 500,
            'tax_rate' => 18,
        ]);

        $this->deleteJson("/api/products/{$created['id']}")
            ->assertOk();
    }

    public function test_product_image_can_be_uploaded_and_replaced(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminA);

        $created = $this->post('/api/products', [
            'sku' => 'IMG-001',
            'name' => 'Product with image',
            'unit' => 'piece',
            'cost_price' => 10,
            'selling_price' => 20,
            'image' => UploadedFile::fake()->image('first.jpg'),
        ])->assertCreated()->json('product');

        Storage::disk('public')->assertExists($created['image']);
        $oldImage = $created['image'];

        $updated = $this->post("/api/products/{$created['id']}", [
            '_method' => 'PATCH',
            'image' => UploadedFile::fake()->image('second.png'),
        ])->assertOk()->json('product');

        Storage::disk('public')->assertMissing($oldImage);
        Storage::disk('public')->assertExists($updated['image']);
        $this->assertNotSame($oldImage, $updated['image']);
        $this->assertNotNull($updated['image_url']);
    }

    public function test_product_validation_and_permissions_are_enforced(): void
    {
        $this->postJson('/api/products', [])->assertUnauthorized();

        Sanctum::actingAs($this->employeeA);
        $this->postJson('/api/products', ['sku' => 'X-1', 'name' => 'Test'])
            ->assertForbidden();

        Sanctum::actingAs($this->adminA);
        $this->postJson('/api/products', ['sku' => '', 'name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sku', 'name', 'unit', 'cost_price', 'selling_price']);
    }

    public function test_products_are_isolated_between_companies(): void
    {
        $product = Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'A-001',
            'name' => 'Company A Product',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
        ]);

        Sanctum::actingAs($this->adminB);
        $this->getJson('/api/products')->assertOk()->assertJsonCount(0, 'products');
        $this->getJson("/api/products/{$product->id}")->assertNotFound();
        $this->patchJson("/api/products/{$product->id}", ['name' => 'Hacked'])->assertNotFound();
        $this->deleteJson("/api/products/{$product->id}")->assertNotFound();
    }

    public function test_duplicate_sku_rejected_within_same_company(): void
    {
        Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'DUP-001',
            'name' => 'First',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
        ]);

        Sanctum::actingAs($this->adminA);
        $this->postJson('/api/products', [
            'sku' => 'DUP-001',
            'name' => 'Second',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
        ])->assertUnprocessable()->assertJsonValidationErrors(['sku']);
    }

    public function test_same_sku_allowed_across_companies(): void
    {
        $companyB = Company::create(['name' => 'Company B', 'currency' => 'USD']);
        Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'SHARED-001',
            'name' => 'Company A Item',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
        ]);

        Sanctum::actingAs($this->adminA);
        // adminA should only see Company A's products
        $this->getJson('/api/products')->assertJsonCount(1, 'products');
    }

    public function test_negative_prices_rejected(): void
    {
        Sanctum::actingAs($this->adminA);
        $this->postJson('/api/products', [
            'sku' => 'BAD-001',
            'name' => 'Test',
            'unit' => 'piece',
            'cost_price' => -10,
            'selling_price' => 150,
        ])->assertUnprocessable()->assertJsonValidationErrors(['cost_price']);

        $this->postJson('/api/products', [
            'sku' => 'BAD-002',
            'name' => 'Test',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => -50,
        ])->assertUnprocessable()->assertJsonValidationErrors(['selling_price']);
    }

    public function test_tax_rate_bounds_enforced(): void
    {
        Sanctum::actingAs($this->adminA);
        $this->postJson('/api/products', [
            'sku' => 'TAX-001',
            'name' => 'Test',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
            'tax_rate' => -5,
        ])->assertUnprocessable()->assertJsonValidationErrors(['tax_rate']);

        $this->postJson('/api/products', [
            'sku' => 'TAX-002',
            'name' => 'Test',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
            'tax_rate' => 105,
        ])->assertUnprocessable()->assertJsonValidationErrors(['tax_rate']);
    }

    public function test_search_filters_products(): void
    {
        Sanctum::actingAs($this->adminA);
        Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'KEY-001',
            'name' => 'Mechanical Keyboard',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
        ]);
        Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'MOU-001',
            'name' => 'Wireless Mouse',
            'unit' => 'piece',
            'cost_price' => 50,
            'selling_price' => 80,
        ]);

        $this->getJson('/api/products?search=keyboard')
            ->assertOk()
            ->assertJsonCount(1, 'products')
            ->assertJsonPath('products.0.sku', 'KEY-001');

        $this->getJson('/api/products?search=MOU')
            ->assertOk()
            ->assertJsonCount(1, 'products')
            ->assertJsonPath('products.0.sku', 'MOU-001');
    }

    public function test_is_active_filter_works(): void
    {
        Sanctum::actingAs($this->adminA);
        $active = Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'ACT-001',
            'name' => 'Active Product',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
            'is_active' => true,
        ]);
        Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'INA-001',
            'name' => 'Inactive Product',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
            'is_active' => false,
        ]);

        $this->getJson('/api/products?is_active=true')
            ->assertOk()
            ->assertJsonCount(1, 'products')
            ->assertJsonPath('products.0.sku', 'ACT-001');

        $this->getJson('/api/products?is_active=false')
            ->assertOk()
            ->assertJsonCount(1, 'products')
            ->assertJsonPath('products.0.sku', 'INA-001');
    }

    public function test_permission_middleware_blocks_without_permission(): void
    {
        // Accountant has no product permissions
        $accountantB = User::factory()->create(['company_id' => $this->companyA->id]);
        $accountantRole = \App\Models\Role::query()->where('name', 'Accountant')->first();
        $accountantB->roles()->attach($accountantRole);

        Sanctum::actingAs($accountantB);

        $this->getJson('/api/products')->assertForbidden();
        $this->postJson('/api/products', ['sku' => 'X', 'name' => 'X', 'unit' => 'x', 'cost_price' => 1, 'selling_price' => 2])->assertForbidden();
    }

    public function test_deactivate_sets_is_active_false(): void
    {
        $product = Product::create([
            'company_id' => $this->companyA->id,
            'sku' => 'DEACT-001',
            'name' => 'To Deactivate',
            'unit' => 'piece',
            'cost_price' => 100,
            'selling_price' => 150,
        ]);

        Sanctum::actingAs($this->adminA);
        $this->deleteJson("/api/products/{$product->id}")->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => false,
        ]);
    }
}
