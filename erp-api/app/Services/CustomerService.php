<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CustomerService
{
    public function listForCompany(User $actor, ?string $search = null): Collection
    {
        $this->ensureCompany($actor);
        return Customer::query()->where('company_id', $actor->company_id)
            ->when($search, fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
            ->orderBy('name')->get();
    }

    public function findForCompany(User $actor, Customer $customer): Customer
    {
        $this->ensureSameCompany($actor, $customer);
        return $customer;
    }

    public function create(User $actor, array $data): Customer
    {
        $this->ensureCompany($actor);
        return Customer::create([...$data, 'company_id' => $actor->company_id]);
    }

    public function update(User $actor, Customer $customer, array $data): Customer
    {
        $this->ensureSameCompany($actor, $customer);
        $customer->update($data);
        return $customer->fresh();
    }

    public function delete(User $actor, Customer $customer): void
    {
        $this->ensureSameCompany($actor, $customer);

        if (DB::table('quotations')->where('customer_id', $customer->id)->exists()) {
            throw new ConflictHttpException('Customers with quotations cannot be deleted. Deactivate the customer instead.');
        }

        $customer->delete();
    }

    private function ensureCompany(User $actor): void
    {
        if (! $actor->company_id) throw new AuthorizationException('You must belong to a company to manage customers.');
    }

    private function ensureSameCompany(User $actor, Customer $customer): void
    {
        if (! $actor->company_id || $customer->company_id !== $actor->company_id) throw new NotFoundHttpException('Customer not found.');
    }
}
