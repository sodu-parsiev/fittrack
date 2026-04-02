<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workout\StoreSessionExerciseRequest;
use App\Http\Requests\Workout\UpdateSessionExerciseRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\SessionExercise;
use App\Models\WorkoutSession;
use App\Services\WorkoutSessionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SessionExerciseController extends Controller
{
    public function __construct(private readonly WorkoutSessionService $workoutSessions)
    {
    }

    public function store(StoreSessionExerciseRequest $request, WorkoutSession $session): WorkoutSessionResource
    {
        $ownedSession = WorkoutSession::query()
            ->whereBelongsTo($request->user())
            ->whereKey($session->getKey())
            ->firstOrFail();

        return new WorkoutSessionResource(
            $this->workoutSessions->createExercise($ownedSession, $request->validated()),
        );
    }

    public function update(UpdateSessionExerciseRequest $request, SessionExercise $exercise): WorkoutSessionResource
    {
        return new WorkoutSessionResource(
            $this->workoutSessions->updateExercise(
                $this->ownedExercise($request, $exercise),
                $request->validated(),
            ),
        );
    }

    public function destroy(Request $request, SessionExercise $exercise): WorkoutSessionResource
    {
        return new WorkoutSessionResource(
            $this->workoutSessions->deleteExercise(
                $this->ownedExercise($request, $exercise),
            ),
        );
    }

    private function ownedExercise(Request $request, SessionExercise $exercise): SessionExercise
    {
        return SessionExercise::query()
            ->with('workoutSession')
            ->whereKey($exercise->getKey())
            ->whereHas('workoutSession', fn (Builder $query) => $query->whereBelongsTo($request->user()))
            ->firstOrFail();
    }
}
