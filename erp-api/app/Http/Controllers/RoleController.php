<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignRoleRequest;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\SyncRolePermissionsRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function __construct(
        private RoleService $roleService
    ) {}

    public function index(): JsonResponse
    {
        $roles = $this->roleService->listForUser(request()->user());

        return response()->json(['roles' => $roles]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Role created successfully.',
            'role' => $role,
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        $role = $this->roleService->findForUser(request()->user(), $role);

        return response()->json(['role' => $role]);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleService->update(
            $request->user(),
            $role,
            $request->validated()
        );

        return response()->json([
            'message' => 'Role updated successfully.',
            'role' => $role,
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->roleService->delete(request()->user(), $role);

        return response()->json([
            'message' => 'Role deleted successfully.',
        ]);
    }

    public function syncPermissions(
        SyncRolePermissionsRequest $request,
        Role $role
    ): JsonResponse {
        $role = $this->roleService->syncPermissions(
            $request->user(),
            $role,
            $request->validated('permissions')
        );

        return response()->json([
            'message' => 'Role permissions updated successfully.',
            'role' => $role,
        ]);
    }
}
