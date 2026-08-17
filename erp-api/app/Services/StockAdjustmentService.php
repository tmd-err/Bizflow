<?php

namespace App\Services;

use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class StockAdjustmentService
{
    private const MOVEMENT_TYPE = 'adjustment';

    public function create(User $actor, Warehouse $warehouse, array $data, array $items): StockAdjustment
    {
        $this->ensureSameCompany($actor, $warehouse);

        return DB::transaction(function () use ($actor, $warehouse, $data, $items) {
            $adjustment = StockAdjustment::create([
                'company_id' => $actor->company_id,
                'warehouse_id' => $warehouse->id,
                'reference' => $data['reference'],
                'reason' => $data['reason'] ?? null,
                'created_by' => $actor->id,
            ]);

            foreach ($items as $item) {
                $this->createAdjustmentItem($adjustment, $item);
            }

            return $adjustment->load(['items.product', 'warehouse']);
        });
    }

    /** Adjustment list for the user's company. */
    public function listForCompany(User $actor): \Illuminate\Database\Eloquent\Collection
    {
        $this->ensureCompany($actor);

        return StockAdjustment::query()
            ->where('company_id', $actor->company_id)
            ->with(['warehouse', 'createdBy', 'items.product'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function findForCompany(User $actor, StockAdjustment $adjustment): StockAdjustment
    {
        $this->ensureSameCompany($actor, $adjustment);
        return $adjustment->load(['items.product', 'warehouse', 'createdBy']);
    }

    private function createAdjustmentItem(StockAdjustment $adjustment, array $item): void
    {
        $difference = (float) ($item['actual_quantity'] ?? 0) - (float) ($item['system_quantity'] ?? 0);

        if ($difference == 0) {
            return;
        }

        StockAdjustmentItem::create([
            'stock_adjustment_id' => $adjustment->id,
            'product_id' => $item['product_id'],
            'system_quantity' => $item['system_quantity'],
            'actual_quantity' => $item['actual_quantity'],
            'difference' => $difference,
        ]);

        // Emit the corresponding stock movement.
        StockMovement::create([
            'company_id' => $adjustment->company_id,
            'product_id' => $item['product_id'],
            'warehouse_id' => $adjustment->warehouse_id,
            'type' => self::MOVEMENT_TYPE,
            'quantity' => $difference,
            'reference_type' => StockAdjustment::class,
            'reference_id' => $adjustment->id,
            'created_by' => $adjustment->created_by,
            'notes' => $adjustment->reason,
        ]);
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new AuthorizationException('You must belong to a company.');
        }
    }

    private function ensureSameCompany(User $actor, StockAdjustment|Warehouse $subject): void
    {
        if (! $actor->company_id || $subject->company_id !== $actor->company_id) {
            throw new NotFoundHttpException('Resource not found.');
        }
    }
}