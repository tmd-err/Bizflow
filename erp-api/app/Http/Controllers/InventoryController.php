<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdjustmentRequest;
use App\Http\Requests\StoreTransferRequest;
use App\Http\Requests\UpdateTransferStatusRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use App\Services\InventoryService;
use App\Services\StockAdjustmentService;
use App\Services\StockTransferService;
use App\Services\WarehouseLocationService;
use App\Services\WarehouseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function __construct(
        private WarehouseService $warehouseService,
        private WarehouseLocationService $locationService,
        private InventoryService $inventoryService,
        private StockAdjustmentService $adjustmentService,
        private StockTransferService $transferService,
    ) {}

    // ── Warehouses ──────────────────────────────────────────────────────────

    public function warehouses(Request $request): JsonResponse
    {
        return response()->json([
            'warehouses' => $this->warehouseService->listForCompany($request->user()),
        ]);
    }

    public function storeWarehouse(Request $request): JsonResponse
    {
        // StoreWarehouseRequest validated by middleware.
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
        ]);

        $warehouse = $this->warehouseService->create($request->user(), $validated);

        return response()->json([
            'message' => 'Warehouse created successfully.',
            'warehouse' => $warehouse,
        ], 201);
    }

    public function showWarehouse(Request $request, Warehouse $warehouse): JsonResponse
    {
        $warehouse = $this->warehouseService->findForCompany($request->user(), $warehouse);

        return response()->json([
            'warehouse' => $warehouse->load('locations'),
        ]);
    }

    public function updateWarehouse(UpdateWarehouseRequest $request, Warehouse $warehouse): JsonResponse
    {
        $warehouse = $this->warehouseService->update($request->user(), $warehouse, $request->validated());

        return response()->json([
            'message' => 'Warehouse updated successfully.',
            'warehouse' => $warehouse,
        ]);
    }

    public function deactivateWarehouse(Request $request, Warehouse $warehouse): JsonResponse
    {
        $this->warehouseService->deactivate($request->user(), $warehouse);

        return response()->json([
            'message' => 'Warehouse deactivated successfully.',
        ]);
    }

    // ── Warehouse Locations ──────────────────────────────────────────────────

    public function warehouseLocations(Request $request, Warehouse $warehouse): JsonResponse
    {
        $locations = $this->locationService->listForWarehouse($request->user(), $warehouse);

        return response()->json([
            'locations' => $locations,
        ]);
    }

    public function storeLocation(Request $request, Warehouse $warehouse): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
        ]);

        $location = $this->locationService->create($request->user(), $warehouse, $validated);

        return response()->json([
            'message' => 'Location created successfully.',
            'location' => $location,
        ], 201);
    }

    public function updateLocation(Request $request, WarehouseLocation $location): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
        ]);

        $location = $this->locationService->update($request->user(), $location, $validated);

        return response()->json([
            'message' => 'Location updated successfully.',
            'location' => $location,
        ]);
    }

    public function deleteLocation(Request $request, WarehouseLocation $location): JsonResponse
    {
        $this->locationService->delete($request->user(), $location);

        return response()->json([
            'message' => 'Location deleted successfully.',
        ]);
    }

    // ── Stock Overview ──────────────────────────────────────────────────────

    public function stockOverview(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->inventoryService; // ensure service loaded

        $warehouseId = $request->query('warehouse_id');
        if ($warehouseId) {
            $warehouse = Warehouse::findOrFail($warehouseId);
            $this->warehouseService->findForCompany($user, $warehouse);
        }

        $movements = $this->inventoryService->getStockByProduct($user);

        // Load product info for display.
        $productIds = $movements->pluck('product_id')->unique();
        $products = \App\Models\Product::query()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        if ($warehouseId) {
            $movements = $movements->where('warehouse_id', $warehouseId);
        }

        // Deduplicate: one row per (product, warehouse, location).
        $rows = $movements->map(function ($m) use ($products) {
            $product = $products->get($m->product_id);

            return [
                'product_id' => $m->product_id,
                'product_name' => $product?->name ?? 'Unknown',
                'product_sku' => $product?->sku ?? '',
                'warehouse_id' => $m->warehouse_id,
                'warehouse_name' => '',
                'location_id' => $m->location_id,
                'location_name' => '',
                'quantity' => (float) $m->quantity,
                'minimum_stock' => $product?->minimum_stock ?? 0,
                'status' => $this->stockStatus((float) $m->quantity, $product?->minimum_stock ?? 0),
            ];
        });

        // Load warehouse and location names in bulk.
        $warehouseIds = $rows->pluck('warehouse_id')->unique();
        $locationIds = $rows->pluck('location_id')->filter()->unique();

        $warehouseNames = Warehouse::whereIn('id', $warehouseIds)->get()->keyBy('id');
        $locationNames = WarehouseLocation::whereIn('id', $locationIds)->get()->keyBy('id');

        $result = $rows->map(function ($row) use ($warehouseNames, $locationNames) {
            $row['warehouse_name'] = $warehouseNames->get($row['warehouse_id'])?->name ?? '';
            $row['location_name'] = $row['location_id'] ? ($locationNames->get($row['location_id'])?->name ?? '') : '';
            return $row;
        })->values()->all();

        return response()->json([
            'stock' => $result,
            'warehouses' => $this->warehouseService
                ->listForCompany($user)
                ->map(fn ($w) => ['id' => $w->id, 'name' => $w->name]),
        ]);
    }

    // ── Stock Movements ──────────────────────────────────────────────────────

    public function stockMovements(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = StockMovement::query()
            ->where('company_id', $user->company_id)
            ->with(['product:id,sku,name', 'warehouse:id,name', 'location:id,name', 'createdBy:id,name'])
            ->orderByDesc('created_at');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->integer('warehouse_id'));
        }
        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->string('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->string('to_date'));
        }

        return response()->json([
            'movements' => $query->get(),
        ]);
    }

    // ── Stock Adjustments ───────────────────────────────────────────────────

    public function adjustments(Request $request): JsonResponse
    {
        return response()->json([
            'adjustments' => $this->adjustmentService->listForCompany($request->user()),
        ]);
    }

    public function showAdjustment(Request $request, StockAdjustment $adjustment): JsonResponse
    {
        return response()->json([
            'adjustment' => $this->adjustmentService->findForCompany($request->user(), $adjustment),
        ]);
    }

    public function storeAdjustment(StoreAdjustmentRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
        $this->warehouseService->findForCompany($user, $warehouse);

        // Compute system quantities for the frontend-provided items.
        $items = collect($validated['items'])->map(function ($item) use ($warehouse) {
            $systemQuantity = $this->inventoryService->getCurrentStock(
                (int) $item['product_id'],
                $warehouse->id
            );

            return [
                'product_id' => $item['product_id'],
                'system_quantity' => $systemQuantity,
                'actual_quantity' => $item['actual_quantity'],
            ];
        })->all();

        $adjustment = $this->adjustmentService->create($user, $warehouse, $validated, $items);

        return response()->json([
            'message' => 'Adjustment created successfully.',
            'adjustment' => $adjustment,
        ], 201);
    }

    // ── Stock Transfers ──────────────────────────────────────────────────────

    public function transfers(Request $request): JsonResponse
    {
        return response()->json([
            'transfers' => $this->transferService->listForCompany($request->user()),
        ]);
    }

    public function showTransfer(Request $request, StockTransfer $transfer): JsonResponse
    {
        return response()->json([
            'transfer' => $this->transferService->findForCompany($request->user(), $transfer),
        ]);
    }

    public function storeTransfer(StoreTransferRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $fromWarehouse = Warehouse::findOrFail($validated['from_warehouse_id']);
        $toWarehouse = Warehouse::findOrFail($validated['to_warehouse_id']);
        $this->warehouseService->findForCompany($user, $fromWarehouse);
        $this->warehouseService->findForCompany($user, $toWarehouse);

        $transfer = $this->transferService->create($user, $fromWarehouse, $toWarehouse, $validated, $validated['items']);

        return response()->json([
            'message' => 'Transfer created successfully.',
            'transfer' => $transfer,
        ], 201);
    }

    public function completeTransfer(UpdateTransferStatusRequest $request, StockTransfer $transfer): JsonResponse
    {
        $transfer = $this->transferService->complete($request->user(), $transfer);

        return response()->json([
            'message' => 'Transfer completed successfully.',
            'transfer' => $transfer,
        ]);
    }

    // ── Dashboard ───────────────────────────────────────────────────────────

    public function dashboard(Request $request): JsonResponse
    {
        $stats = $this->inventoryService->getDashboardStats($request->user());
        $lowStock = $this->inventoryService->getLowStockProducts($request->user());
        $outOfStock = $this->inventoryService->getOutOfStockProducts($request->user());

        return response()->json([
            'stats' => $stats,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
        ]);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function stockStatus(float $quantity, ?float $minStock): string
    {
        $min = $minStock ?? 0;

        if ($quantity <= 0) {
            return 'out_of_stock';
        }

        if ($quantity <= $min) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}