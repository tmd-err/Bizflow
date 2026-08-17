<?php

namespace App\Services;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class WarehouseService
{
    public function listForCompany(User $actor): Collection
    {
        $this->ensureCompany($actor);

        return Warehouse::query()
            ->where('company_id', $actor->company_id)
            ->orderBy('name')
            ->get();
    }

    public function findForCompany(User $actor, Warehouse $warehouse): Warehouse
    {
        $this->ensureSameCompany($actor, $warehouse);
        return $warehouse;
    }

    public function create(User $actor, array $data): Warehouse
    {
        $this->ensureCompany($actor);

        return Warehouse::create([
            ...$data,
            'company_id' => $actor->company_id,
            'is_active' => true,
        ]);
    }

    public function update(User $actor, Warehouse $warehouse, array $data): Warehouse
    {
        $this->ensureSameCompany($actor, $warehouse);
        $warehouse->update($data);
        return $warehouse->fresh();
    }

    public function deactivate(User $actor, Warehouse $warehouse): void
    {
        $this->ensureSameCompany($actor, $warehouse);
        $warehouse->update(['is_active' => false]);
    }

    public function reactivate(User $actor, Warehouse $warehouse): Warehouse
    {
        $this->ensureSameCompany($actor, $warehouse);
        $warehouse->update(['is_active' => true]);
        return $warehouse->fresh();
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