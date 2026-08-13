<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RoleService
{
    public function listForUser(User $user): Collection
    {
        $this->ensureUserHasCompany($user);

        return Role::query()
            ->where('company_id', $user->company_id)
            ->with('permissions:id,name,description')
            ->orderBy('name')
            ->get();
    }

    public function findForUser(User $user, Role $role): Role
    {
        $this->ensureRoleBelongsToUserCompany($user, $role);

        return $role->load('permissions:id,name,description');
    }

    public function create(User $user, array $data): Role
    {
        $this->ensureUserHasCompany($user);

        return Role::create([
            'company_id' => $user->company_id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);
    }

    public function update(User $user, Role $role, array $data): Role
    {
        $this->ensureRoleBelongsToUserCompany($user, $role);

        $role->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return $role->fresh()->load('permissions:id,name,description');
    }

    public function delete(User $user, Role $role): void
    {
        $this->ensureRoleBelongsToUserCompany($user, $role);

        $role->delete();
    }

    /**
     * @param  list<string>  $permissionNames
     */
    public function syncPermissions(User $user, Role $role, array $permissionNames): Role
    {
        $this->ensureRoleBelongsToUserCompany($user, $role);

        $permissionIds = Permission::query()
            ->whereIn('name', $permissionNames)
            ->pluck('id');

        if ($permissionIds->count() !== count(array_unique($permissionNames))) {
            throw new NotFoundHttpException('One or more permissions were not found.');
        }

        $role->permissions()->sync($permissionIds);

        return $role->fresh()->load('permissions:id,name,description');
    }

    public function assignRole(User $actor, User $targetUser, Role $role): void
    {
        $this->ensureUsersShareCompany($actor, $targetUser);
        $this->ensureRoleBelongsToUserCompany($targetUser, $role);

        if (! $targetUser->company_id) {
            throw new AuthorizationException('The user must belong to a company.');
        }

        $targetUser->roles()->syncWithoutDetaching([$role->id]);
    }

    public function removeRole(User $actor, User $targetUser, Role $role): void
    {
        $this->ensureUsersShareCompany($actor, $targetUser);
        $this->ensureRoleBelongsToUserCompany($targetUser, $role);

        $targetUser->roles()->detach($role->id);
    }

    private function ensureUserHasCompany(User $user): void
    {
        if (! $user->company_id) {
            throw new AuthorizationException('You must belong to a company to manage roles.');
        }
    }

    private function ensureRoleBelongsToUserCompany(User $user, Role $role): void
    {
        if (! $user->company_id || $user->company_id !== $role->company_id) {
            throw new AuthorizationException('You cannot access roles outside your company.');
        }
    }

    private function ensureUsersShareCompany(User $actor, User $targetUser): void
    {
        if (! $actor->company_id || ! $targetUser->company_id || $actor->company_id !== $targetUser->company_id) {
            throw new AuthorizationException('You cannot modify users outside your company.');
        }
    }
}
