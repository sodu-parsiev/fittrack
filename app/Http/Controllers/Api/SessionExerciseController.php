<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workout\StoreSessionExerciseRequest;
use App\Http\Requests\Workout\UpdateSessionExerciseRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\SessionExercise;
use App\Models\WorkoutSession;
use App\Services\WorkoutActorResolver;
use App\Services\WorkoutSessionService;
use Illuminate\Http\Request;

class SessionExerciseController extends Controller
{
    public function __construct(
        private readonly WorkoutSessionService $workoutSessions,
        private readonly WorkoutActorResolver $actors,
    ) {}

    public function store(StoreSessionExerciseRequest $request, WorkoutSession $session): WorkoutSessionResource
    {
        $ownedSession = $this->workoutSessions->ownedSession(
            $this->actors->fromRequest($request),
            $session,
        );

        return new WorkoutSessionResource(
            $this->workoutSessions->createExercise($ownedSession, $request->validated()),
        );
    }

    public function update(UpdateSessionExerciseRequest $request, SessionExercise $exercise): WorkoutSessionResource
    {
        return new WorkoutSessionResource(
            $this->workoutSessions->updateExercise(
                $this->workoutSessions->ownedExercise(
                    $this->actors->fromRequest($request),
                    $exercise,
                ),
                $request->validated(),
            ),
        );
    }

    public function destroy(Request $request, SessionExercise $exercise): WorkoutSessionResource
    {
        return new WorkoutSessionResource(
            $this->workoutSessions->deleteExercise(
                $this->workoutSessions->ownedExercise(
                    $this->actors->fromRequest($request),
                    $exercise,
                ),
            ),
        );
    }
}
