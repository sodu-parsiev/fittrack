<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\WorkoutSessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Workout\UpdateWorkoutSessionRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\User;
use App\Models\WorkoutSession;
use App\Services\WorkoutSessionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class WorkoutSessionController extends Controller
{
    public function __construct(private readonly WorkoutSessionService $workoutSessions)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in([
                WorkoutSessionStatus::Active->value,
                WorkoutSessionStatus::Completed->value,
            ])],
        ]);

        /** @var User $user */
        $user = $request->user();
        $status = isset($validated['status']) ? WorkoutSessionStatus::from((string) $validated['status']) : null;

        return WorkoutSessionResource::collection(
            $this->workoutSessions->listSessions($user, $status),
        );
    }

    public function store(Request $request): WorkoutSessionResource
    {
        /** @var User $user */
        $user = $request->user();

        return new WorkoutSessionResource(
            $this->workoutSessions->getOrCreateActiveSessionFor($user),
        );
    }

    public function update(UpdateWorkoutSessionRequest $request, WorkoutSession $session): WorkoutSessionResource
    {
        /** @var User $user */
        $user = $request->user();

        $ownedSession = WorkoutSession::query()
            ->whereBelongsTo($user)
            ->whereKey($session->getKey())
            ->firstOrFail();

        $validated = $request->validated();

        if (($validated['status'] ?? null) === WorkoutSessionStatus::Completed->value) {
            return new WorkoutSessionResource(
                $this->workoutSessions->completeSession(
                    $ownedSession,
                    isset($validated['title']) ? (string) $validated['title'] : null,
                ),
            );
        }

        if (array_key_exists('title', $validated)) {
            $ownedSession->update([
                'title' => $validated['title'],
            ]);
        }

        return new WorkoutSessionResource(
            $this->workoutSessions->loadSession($ownedSession->fresh()),
        );
    }
}
