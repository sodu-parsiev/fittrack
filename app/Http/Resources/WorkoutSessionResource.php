<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\WorkoutSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin WorkoutSession */
class WorkoutSessionResource extends JsonResource
{
    /**
     * @return array<string, int|float|string|null|bool|array<int, mixed>>
     */
    public function toArray(Request $request): array
    {
        $exerciseCount = $this->relationLoaded('sessionExercises') ? $this->sessionExercises->count() : 0;
        $totalSets = 0;
        $totalVolume = 0.0;

        if ($this->relationLoaded('sessionExercises')) {
            foreach ($this->sessionExercises as $exercise) {
                if (! $exercise->relationLoaded('exerciseSets')) {
                    continue;
                }

                $totalSets += $exercise->exerciseSets->count();

                foreach ($exercise->exerciseSets as $set) {
                    $totalVolume += $set->reps * (float) $set->weight;
                }
            }
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status->value,
            'startedAt' => $this->started_at?->toIso8601String(),
            'endedAt' => $this->ended_at?->toIso8601String(),
            'isActive' => $this->isActive(),
            'exerciseCount' => $exerciseCount,
            'totalSets' => $totalSets,
            'totalVolume' => round($totalVolume, 2),
            'exercises' => SessionExerciseResource::collection($this->whenLoaded('sessionExercises')),
        ];
    }
}
