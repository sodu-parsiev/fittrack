<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Workout\StoreExerciseSetRequest;
use App\Http\Resources\WorkoutSessionResource;
use App\Models\SessionExercise;
use App\Services\WorkoutActorResolver;
use App\Services\WorkoutSessionService;
use Illuminate\Http\Request;

class ExerciseSetController extends Controller
{
    public function __construct(
        private readonly WorkoutSessionService $workoutSessions,
        private readonly WorkoutActorResolver $actors,
    ) {}

    public function store(StoreExerciseSetRequest $request, SessionExercise $exercise): WorkoutSessionResource
    {
        return new WorkoutSessionResource(
            $this->workoutSessions->addSet(
                $this->workoutSessions->ownedExercise(
                    $this->actors->fromRequest($request),
                    $exercise,
                ),
                $request->validated(),
            ),
        );
    }
}
