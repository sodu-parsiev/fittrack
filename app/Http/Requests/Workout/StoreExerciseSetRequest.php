<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

use Illuminate\Foundation\Http\FormRequest;

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
            'weight' => ['required', 'numeric', 'min:0', 'max:999.99'],
        ];
    }
}
