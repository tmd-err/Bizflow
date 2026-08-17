<?php

namespace App\Services;

use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class StockTransferService
{
    public function create(User $actor, Warehouse $fromWarehouse, Warehouse $toWarehouse, array $data, array $items): StockTransfer
    {
        $this->ensureSameCompany($actor, $fromWarehouse);
        $this->ensureSameCompany($actor, $toWarehouse);

        if ($fromWarehouse->id === $toWarehouse->id) {
            throw new \InvalidArgumentException('Source and destination warehouses must differ.');
        }

        return DB::transaction(function () use ($actor, $fromWarehouse, $toWarehouse, $data, $items) {
            $transfer = StockTransfer::create([
                'company_id' => $actor->company_id,
                'from_warehouse_id' => $fromWarehouse->id,
                'to_warehouse_id' => $toWarehouse->id,
                'reference' => $data['reference'],
                'status' => $data['status'] ?? 'pending',
                'created_by' => $actor->id,
            ]);

            foreach ($items as $item) {
                $transfer->items()->create($item);
            }

            return $transfer->load(['items.product', 'fromWarehouse', 'toWarehouse']);
        });
    }

    public function listForCompany(User $actor): \Illuminate\Database\Eloquent\Collection
    {
        $this->ensureCompany($actor);

        return StockTransfer::query()
            ->where('company_id', $actor->company_id)
            ->with(['fromWarehouse', 'toWarehouse', 'items.product', 'createdBy'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function findForCompany(User $actor, StockTransfer $transfer): StockTransfer
    {
        $this->ensureSameCompany($actor, $transfer);
        return $transfer->load(['items.product', 'fromWarehouse', 'toWarehouse', 'createdBy']);
    }

    public function complete(User $actor, StockTransfer $transfer): StockTransfer
    {
        $this->ensureSameCompany($actor, $transfer);

        if ($transfer->status === 'completed') {
            return $transfer->load(['items.product', 'fromWarehouse', 'toWarehouse']);
        }

        return DB::transaction(function () use ($actor, $transfer) {
            $now = now();
            foreach ($transfer->items as $item) {
                $productId = $item->product_id;
                $quantity = (float) $item->quantity;

                // OUT movement from source warehouse.
                StockMovement::create([
                    'company_id' => $transfer->company_id,
                    'product_id' => $productId,
                    'warehouse_id' => $transfer->from_warehouse_id,
                    'type' => 'transfer_out',
                    'quantity' => -$quantity,
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'created_by' => $actor->id,
                    'notes' => "Transfer {$transfer->reference}: out",
                ]);

                // IN movement to destination warehouse.
                StockMovement::create([
                    'company_id' => $transfer->company_id,
                    'product_id' => $productId,
                    'warehouse_id' => $transfer->to_warehouse_id,
                    'type' => 'transfer_in',
                    'quantity' => $quantity,
                    'reference_type' => StockTransfer::class,
                    'reference_id' => $transfer->id,
                    'created_by' => $actor->id,
                    'notes' => "Transfer {$transfer->reference}: in",
                ]);
            }

            $transfer->update([
                'status' => 'completed',
                'updated_at' => $now,
            ]);

            return $transfer->load(['items.product', 'fromWarehouse', 'toWarehouse']);
        });
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new AuthorizationException('You must belong to a company.');
        }
    }

    private function ensureSameCompany(User $actor, StockTransfer $transfer): void
    {
        if (! $actor->company_id || $transfer->company_id !== $actor->company_id) {
            throw new NotFoundHttpException('Transfer not found.');
        }
    }

    
}