<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

use App\Enums\MuscleGroup;
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
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'category' => ['sometimes', Rule::enum(MuscleGroup::class)],
            'uses_self_weight' => ['sometimes', 'boolean'],
            'current_weight' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999.99'],
            'target_reps' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
