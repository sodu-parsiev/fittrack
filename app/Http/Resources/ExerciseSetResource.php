<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExerciseSet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExerciseSet */
class ExerciseSetResource extends JsonResource
{
    /**
     * @return array<string, int|float|string|null>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'setNumber' => $this->set_number,
            'reps' => $this->reps,
            'weight' => (float) $this->weight,
            'completedAt' => $this->completed_at?->toIso8601String(),
        ];
    }
}
