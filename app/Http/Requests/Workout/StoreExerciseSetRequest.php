<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

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
        return [
            'reps' => ['required', 'integer', 'min:1', 'max:100'],
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
