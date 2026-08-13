<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChangeVerificationNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $code
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirm Your New BizFlow Email')
            ->greeting('Hello!')
            ->line('You requested to change your BizFlow account email address.')
            ->line('Use the verification code below to confirm this email belongs to you:')
            ->line('**' . $this->code . '**')
            ->line('This code expires in 10 minutes.')
            ->line('If you did not request this change, you can ignore this email.');
    }
}
