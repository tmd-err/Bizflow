<?php

namespace App\Services;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SupplierService
{
    public function listForCompany(User $actor): Collection
    {
        $this->ensureCompany($actor);

        return Supplier::query()
            ->where('company_id', $actor->company_id)
            ->orderBy('name')
            ->get();
    }

    public function findForCompany(User $actor, Supplier $supplier): Supplier
    {
        $this->ensureSameCompany($actor, $supplier);
        return $supplier->load(['addresses', 'contacts']);
    }

    public function create(User $actor, array $data): Supplier
    {
        $this->ensureCompany($actor);

        return Supplier::create([
            ...$data,
            'company_id' => $actor->company_id,
            'is_active' => true,
        ]);
    }

    public function update(User $actor, Supplier $supplier, array $data): Supplier
    {
        $this->ensureSameCompany($actor, $supplier);
        $supplier->update($data);
        return $supplier->fresh();
    }

    public function deactivate(User $actor, Supplier $supplier): void
    {
        $this->ensureSameCompany($actor, $supplier);
        $supplier->update(['is_active' => false]);
    }

    public function reactivate(User $actor, Supplier $supplier): Supplier
    {
        $this->ensureSameCompany($actor, $supplier);
        $supplier->update(['is_active' => true]);
        return $supplier->fresh();
    }

    public function addAddress(User $actor, Supplier $supplier, array $data): \Illuminate\Database\Eloquent\Model
    {
        $this->ensureSameCompany($actor, $supplier);

        return $supplier->addresses()->create([
            ...$data,
            'company_id' => $actor->company_id,
        ]);
    }

    public function addContact(User $actor, Supplier $supplier, array $data): \Illuminate\Database\Eloquent\Model
    {
        $this->ensureSameCompany($actor, $supplier);

        return $supplier->contacts()->create([
            ...$data,
            'company_id' => $actor->company_id,
        ]);
    }

    public function deleteAddress(User $actor, int $supplierId, int $addressId): void
    {
        $supplier = Supplier::where('company_id', $actor->company_id)
            ->where('id', $supplierId)
            ->firstOrFail();
        $supplier->addresses()->where('id', $addressId)->delete();
    }

    public function deleteContact(User $actor, int $supplierId, int $contactId): void
    {
        $supplier = Supplier::where('company_id', $actor->company_id)
            ->where('id', $supplierId)
            ->firstOrFail();
        $supplier->contacts()->where('id', $contactId)->delete();
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) {
            throw new AuthorizationException('You must belong to a company.');
        }
    }

    private function ensureSameCompany(User $actor, Supplier $subject): void
    {
        if (! $actor->company_id || $subject->company_id !== $actor->company_id) {
            throw new NotFoundHttpException('Supplier not found.');
        }
    }
}