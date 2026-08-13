<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function create(User $actor, array $data): User
    {
        $this->ensureUserHasCompany($actor);

        return DB::transaction(function () use ($actor, $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'company_id' => $actor->company_id,
            ]);

            if (! empty($data['role_ids'])) {
                $user->roles()->sync($data['role_ids']);
            }

            return $user->load(['roles:id,name,description']);
        });
    }

    public function listForCompany(User $actor): Collection
    {
        $this->ensureUserHasCompany($actor);

        return User::query()
            ->where('company_id', $actor->company_id)
            ->with(['roles:id,name,description'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'company_id', 'created_at']);
    }

    public function findForCompany(User $actor, User $target): User
    {
        $this->ensureUsersShareCompany($actor, $target);

        return $target->load(['roles:id,name,description']);
    }

    private function ensureUserHasCompany(User $user): void
    {
        if (! $user->company_id) {
            throw new AuthorizationException('You must belong to a company to manage users.');
        }
    }

    private function ensureUsersShareCompany(User $actor, User $target): void
    {
        if (! $actor->company_id || ! $target->company_id || $actor->company_id !== $target->company_id) {
            throw new AuthorizationException('You cannot access users outside your company.');
        }
    }
}
