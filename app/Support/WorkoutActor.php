<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\User;

final readonly class WorkoutActor
{
    private function __construct(
        public ?User $user,
        public ?string $guestToken,
    ) {
    }

    public static function forUser(User $user): self
    {
        return new self($user, null);
    }

    public static function forGuest(string $guestToken): self
    {
        return new self(null, $guestToken);
    }

    public function isAuthenticated(): bool
    {
        return $this->user instanceof User;
    }

    public function isGuest(): bool
    {
        return ! $this->isAuthenticated();
    }
}
