<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use App\Models\User;
class InventoryService
{
    // Centralised stock look-up — used by the dashboard, overview and
    // low-stock detection so every consumer shares the same query shape.

    public function getStockByProduct(User $actor, ?int $productId = null): Collection
    {
        $this->ensureCompany($actor);

        $query = StockMovement::query()
            ->select([
                'product_id',
                'warehouse_id',
                'location_id',
                \DB::raw('SUM(quantity) as quantity'),
            ])
            ->where('company_id', $actor->company_id)
            ->groupBy('product_id', 'warehouse_id', 'location_id');

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $query->get();
    }

    public function getStockByWarehouse(User $actor, ?int $warehouseId = null): Collection
    {
        $this->ensureCompany($actor);

        $query = StockMovement::query()
            ->select([
                'product_id',
                'warehouse_id',
                'location_id',
                \DB::raw('SUM(quantity) as quantity'),
            ])
            ->where('company_id', $actor->company_id)
            ->groupBy('product_id', 'warehouse_id', 'location_id');

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        return $query->get();
    }

    /** Sum of movements for one product at one warehouse (optionally one location). */
    public function getCurrentStock(int $productId, int $warehouseId, ?int $locationId = null): float
    {
        return (float) StockMovement::query()
            ->where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->when($locationId, fn ($q) => $q->where('location_id', $locationId))
            ->sum(\DB::raw('COALESCE(quantity, 0)'));
    }

    /** Low-stock products for the company: current stock ≤ minimum_stock and > 0. */
    public function getLowStockProducts(User $actor): Collection
    {
        $this->ensureCompany($actor);

        $movements = StockMovement::query()
            ->select([
                'product_id',
                'warehouse_id',
                \DB::raw('COALESCE(SUM(quantity), 0) as quantity'),
            ])
            ->where('company_id', $actor->company_id)
            ->groupBy('product_id', 'warehouse_id');

        return Product::query()
            ->where('company_id', $actor->company_id)
            ->where('is_active', true)
            ->joinSub($movements, 'sm', function ($join) {
                $join->on('products.id', '=', 'sm.product_id');
            })
            ->where(\DB::raw('COALESCE(sm.quantity, 0)'), '<=', \DB::raw('products.minimum_stock'))
            ->where(\DB::raw('COALESCE(sm.quantity, 0)'), '>', 0)
            ->select('products.*')
            ->distinct()
            ->get();
    }

    /** Products fully out of stock across all company warehouses. */
    public function getOutOfStockProducts(User $actor): Collection
    {
        $this->ensureCompany($actor);

        $movements = StockMovement::query()
            ->select(['product_id'])
            ->where('company_id', $actor->company_id)
            ->groupBy('product_id')
            ->having(\DB::raw('COALESCE(SUM(quantity), 0)'), '<=', 0);

        return Product::query()
            ->where('company_id', $actor->company_id)
            ->where('is_active', true)
            ->whereNotIn('id', $movements)
            ->get();
    }

    /** Dashboard aggregates for the company. */
    public function getDashboardStats(User $actor): array
    {
        $this->ensureCompany($actor);

        $companyId = $actor->company_id;

        $totalProductsWithStock = StockMovement::query()
            ->where('company_id', $companyId)
            ->distinct('product_id')
            ->count(\DB::raw('DISTINCT product_id'));

        $totalStockQuantity = (float) StockMovement::query()
            ->where('company_id', $companyId)
            ->sum(\DB::raw('COALESCE(quantity, 0)'));

        $lowStockCount = $this->getLowStockProducts($actor)->count();
        $outOfStockCount = $this->getOutOfStockProducts($actor)->count();

        // Stock value = sum of movements quantity * unit_cost (only where unit_cost is set).
        $stockValue = StockMovement::query()
            ->where('company_id', $companyId)
            ->whereNotNull('unit_cost')
            ->get()
            ->sum(fn ($m) => (float) $m->quantity * (float) $m->unit_cost);

        return [
            'total_products_with_stock' => $totalProductsWithStock,
            'total_stock_quantity' => $totalStockQuantity,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'stock_value' => $stockValue,
        ];
    }

    /** All warehouses belonging to the company. */
    public function getCompanyWarehouses(User $actor): Collection
    {
        $this->ensureCompany($actor);

        return Warehouse::query()
            ->where('company_id', $actor->company_id)
            ->orderBy('name')
            ->get();
    }

    /** Movable product → warehouse combinations (stock > 0) for transfers. */
    public function getMovableStocks(User $actor): Collection
    {
        $this->ensureCompany($actor);

        return StockMovement::query()
            ->select([
                'product_id',
                'warehouse_id',
                'location_id',
                \DB::raw('COALESCE(SUM(quantity), 0) as quantity'),
            ])
            ->where('company_id', $actor->company_id)
            ->groupBy('product_id', 'warehouse_id', 'location_id')
            ->having(\DB::raw('COALESCE(SUM(quantity), 0)'), '>', 0)
            ->get();
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'You must belong to a company.'
            );
        }
    }
}