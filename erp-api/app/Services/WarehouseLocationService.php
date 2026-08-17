<?php

namespace App\Services;

use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WarehouseLocationService
{
    public function listForWarehouse(User $actor, Warehouse $warehouse): Collection
    {
        $this->ensureSameCompany($actor, $warehouse);

        return WarehouseLocation::query()
            ->where('warehouse_id', $warehouse->id)
            ->orderBy('code')
            ->get();
    }

    public function findForCompany(User $actor, WarehouseLocation $location): WarehouseLocation
    {
        $location->load('warehouse');
        $this->ensureSameCompany($actor, $location->warehouse);
        return $location;
    }

    public function create(User $actor, Warehouse $warehouse, array $data): WarehouseLocation
    {
        $this->ensureSameCompany($actor, $warehouse);

        return WarehouseLocation::create([
            ...$data,
            'warehouse_id' => $warehouse->id,
        ]);
    }

    public function update(User $actor, WarehouseLocation $location, array $data): WarehouseLocation
    {
        $location->load('warehouse');
        $this->ensureSameCompany($actor, $location->warehouse);
        $location->update($data);
        return $location->fresh();
    }

    public function delete(User $actor, WarehouseLocation $location): void
    {
        $location->load('warehouse');
        $this->ensureSameCompany($actor, $location->warehouse);
        $location->delete();
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new AuthorizationException('You must belong to a company.');
        }
    }

    private function ensureSameCompany(User $actor, Warehouse $warehouse): void
    {
        if (! $actor->company_id || $warehouse->company_id !== $actor->company_id) {
            throw new NotFoundHttpException('Warehouse not found.');
        }
    }
}