<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

use App\Enums\MuscleGroup;
use App\Models\SessionExercise;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExerciseSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        $exercise = $this->route('exercise');
        if (! $exercise instanceof SessionExercise && is_scalar($exercise)) {
            $exercise = SessionExercise::query()->find($exercise);
        }
        $isCardio = $exercise instanceof SessionExercise && $exercise->category === MuscleGroup::Cardio;

        return [
            'reps' => [Rule::requiredIf(! $isCardio), 'nullable', 'integer', 'min:1', 'max:1000'],
            'duration_seconds' => [Rule::requiredIf($isCardio), 'nullable', 'integer', 'min:1', 'max:359999'],
            'uses_self_weight' => ['sometimes', 'boolean'],
            'weight' => [
                'nullable',
                Rule::requiredIf(fn (): bool => ! $this->boolean('uses_self_weight')),
                'numeric',
                'min:0',
                'max:999.99',
            ],
        ];
    }
}
