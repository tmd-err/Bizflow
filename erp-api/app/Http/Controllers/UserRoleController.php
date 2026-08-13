<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignRoleRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;

class UserRoleController extends Controller
{
    public function __construct(
        private RoleService $roleService
    ) {}

    public function store(AssignRoleRequest $request, User $user): JsonResponse
    {
        $role = Role::findOrFail($request->validated('role_id'));

        $this->roleService->assignRole(
            $request->user(),
            $user,
            $role
        );

        return response()->json([
            'message' => 'Role assigned successfully.',
            'roles' => $user->fresh()->roles()->get(['roles.id', 'roles.name', 'roles.description']),
        ], 201);
    }

    public function destroy(User $user, Role $role): JsonResponse
    {
        $this->roleService->removeRole(
            request()->user(),
            $user,
            $role
        );

        return response()->json([
            'message' => 'Role removed successfully.',
            'roles' => $user->fresh()->roles()->get(['roles.id', 'roles.name', 'roles.description']),
        ]);
    }
}
