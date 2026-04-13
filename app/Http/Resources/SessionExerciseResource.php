<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\SessionExercise;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SessionExercise */
class SessionExerciseResource extends JsonResource
{
    /**
     * @return array<string, int|float|string|bool|null|array<int, mixed>>
     */
    public function toArray(Request $request): array
    {
        $sets = $this->whenLoaded('exerciseSets');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category?->value,
            'categoryLabel' => $this->category?->label(),
            'sortOrder' => $this->sort_order,
            'currentWeight' => (float) $this->current_weight,
            'usesSelfWeight' => (bool) $this->uses_self_weight,
            'targetReps' => $this->target_reps,
            'targetDurationSeconds' => $this->target_duration_seconds,
            'completedSets' => $this->relationLoaded('exerciseSets') ? $this->exerciseSets->count() : 0,
            'sets' => ExerciseSetResource::collection($sets),
        ];
    }
}
