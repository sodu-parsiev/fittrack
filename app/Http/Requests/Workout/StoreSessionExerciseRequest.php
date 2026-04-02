<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

use App\Enums\MuscleGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSessionExerciseRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', Rule::enum(MuscleGroup::class)],
            'current_weight' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'target_reps' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
