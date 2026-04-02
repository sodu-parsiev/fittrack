<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workout\StoreExerciseSetRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\SessionExercise;
use App\Services\WorkoutSessionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ExerciseSetController extends Controller
{
    public function __construct(private readonly WorkoutSessionService $workoutSessions)
    {
    }

    public function store(StoreExerciseSetRequest $request, SessionExercise $exercise): WorkoutSessionResource
    {
        return new WorkoutSessionResource(
            $this->workoutSessions->addSet(
                $this->ownedExercise($request, $exercise),
                $request->validated(),
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
