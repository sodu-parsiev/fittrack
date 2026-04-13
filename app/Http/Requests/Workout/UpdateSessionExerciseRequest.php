<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

use App\Enums\MuscleGroup;
use App\Models\SessionExercise;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSessionExerciseRequest extends FormRequest
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
        $currentCategory = $exercise instanceof SessionExercise ? $exercise->category?->value : null;
        $resolvedCategory = $this->input('category', $currentCategory);
        $isCardio = $resolvedCategory === MuscleGroup::Cardio->value;
        $isChangingCategory = $this->has('category');

        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'category' => ['sometimes', Rule::enum(MuscleGroup::class)],
            'uses_self_weight' => ['sometimes', 'boolean'],
            'current_weight' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999.99'],
            'target_reps' => [Rule::requiredIf($isChangingCategory && ! $isCardio), 'nullable', 'integer', 'min:1', 'max:100'],
            'target_duration_seconds' => [Rule::requiredIf($isChangingCategory && $isCardio), 'nullable', 'integer', 'min:1', 'max:359999'],
        ];
    }
}
