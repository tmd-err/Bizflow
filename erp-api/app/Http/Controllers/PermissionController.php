<?php

namespace App\Http\Controllers;

use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function __construct(
        private PermissionService $permissionService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'permissions' => $this->permissionService->all(),
        ]);
    }
}
