<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(): JsonResponse
    {
        $users = $this->userService->listForCompany(request()->user());

        return response()->json(['users' => $users]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $user = $this->userService->findForCompany(request()->user(), $user);

        return response()->json(['user' => $user]);
    }
}
