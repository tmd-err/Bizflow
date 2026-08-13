<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\EmailChangeVerificationNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    public function update(User $user, array $data): User
    {
        if ($data['email'] !== $user->email) {
            $this->verifyEmailCode(
                $user,
                $data['email'],
                $data['email_verification_code']
            );
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        return $user->fresh();
    }

    public function sendEmailVerificationCode(User $user, string $email): void
    {
        if ($email === $user->email) {
            throw ValidationException::withMessages([
                'email' => ['The new email must be different from your current email.'],
            ]);
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put(
            $this->emailVerificationCacheKey($user, $email),
            $code,
            now()->addMinutes(10)
        );

        Notification::route('mail', $email)
            ->notify(new EmailChangeVerificationNotification($code));
    }

    public function updatePassword(
        User $user,
        string $currentPassword,
        string $password
    ): void {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => $password,
        ]);

        $user->tokens()->delete();
    }

    private function verifyEmailCode(
        User $user,
        string $email,
        string $code
    ): void {
        $cacheKey = $this->emailVerificationCacheKey($user, $email);
        $cachedCode = Cache::get($cacheKey);

        if (! $cachedCode || $cachedCode !== $code) {
            throw ValidationException::withMessages([
                'email_verification_code' => [
                    'The verification code is invalid or has expired.',
                ],
            ]);
        }

        Cache::forget($cacheKey);
    }

    private function emailVerificationCacheKey(User $user, string $email): string
    {
        return 'email_change:' . $user->id . ':' . strtolower($email);
    }
}
