<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\WorkoutSessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Workout\UpdateWorkoutSessionRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\WorkoutSession;
use App\Services\WorkoutActorResolver;
use App\Services\WorkoutSessionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class WorkoutSessionController extends Controller
{
    public function __construct(
        private readonly WorkoutSessionService $workoutSessions,
        private readonly WorkoutActorResolver $actors,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in([
                WorkoutSessionStatus::Active->value,
                WorkoutSessionStatus::Completed->value,
            ])],
        ]);

        $status = isset($validated['status']) ? WorkoutSessionStatus::from((string) $validated['status']) : null;
        $actor = $this->actors->fromRequest($request);

        return WorkoutSessionResource::collection(
            $this->workoutSessions->listSessionsForActor($actor, $status),
        );
    }

    public function store(Request $request): WorkoutSessionResource
    {
        $actor = $this->actors->fromRequest($request);

        return new WorkoutSessionResource(
            $this->workoutSessions->getOrCreateActiveSessionForActor($actor),
        );
    }

    public function update(UpdateWorkoutSessionRequest $request, WorkoutSession $session): WorkoutSessionResource
    {
        $ownedSession = $this->workoutSessions->ownedSession(
            $this->actors->fromRequest($request),
            $session,
        );
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
