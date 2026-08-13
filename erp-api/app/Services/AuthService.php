<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthService
{
    public function getMePayload(User $user): array
    {
        $user->loadMissing('company');

        $roles = $user->roles()
            ->select('roles.id', 'roles.name', 'roles.description')
            ->get();

        return [
            'user' => $user->only(['id', 'name', 'email', 'email_verified_at', 'company_id']),
            'company' => $user->company,
            'roles' => $roles,
            'permissions' => $user->getPermissionNames()->values()->all(),
        ];
    }

    public function forgotPassword(string $email): string
    {
        return Password::sendResetLink([
            'email' => $email,
        ]);
    }

    public function resetPassword(
        string $email,
        string $token,
        string $password
    ): string {
        return Password::reset(
            [
                'email' => $email,
                'password' => $password,
                'password_confirmation' => $password,
                'token' => $token,
            ],
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                $user->tokens()->delete();
            }
        );
    }
}