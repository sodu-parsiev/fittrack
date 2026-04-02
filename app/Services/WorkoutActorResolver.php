<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Support\WorkoutActor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WorkoutActorResolver
{
    public const GUEST_HEADER = 'X-Workout-Guest';

    public function fromRequest(Request $request): WorkoutActor
    {
        /** @var User|null $user */
        $user = $request->user('sanctum');

        if ($user instanceof User) {
            return WorkoutActor::forUser($user);
        }

        $guestToken = trim((string) $request->header(self::GUEST_HEADER));

        if ($guestToken === '') {
            throw ValidationException::withMessages([
                'guest' => 'A guest workout token is required.',
            ]);
        }

        return WorkoutActor::forGuest($guestToken);
    }
}
