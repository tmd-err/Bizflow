<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendEmailVerificationCodeRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService
    ) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->profileService->update(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

    public function sendEmailVerificationCode(
        SendEmailVerificationCodeRequest $request
    ): JsonResponse {
        $this->profileService->sendEmailVerificationCode(
            $request->user(),
            $request->validated('email')
        );

        return response()->json([
            'message' => 'Verification code sent to your new email address.',
        ]);
    }

    public function updatePassword(
        UpdatePasswordRequest $request
    ): JsonResponse {
        $this->profileService->updatePassword(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password')
        );

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}