<?php

declare(strict_types=1);

namespace App\Http\Requests\Workout;

use App\Enums\WorkoutSessionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWorkoutSessionRequest extends FormRequest
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
            'status' => ['sometimes', Rule::in([WorkoutSessionStatus::Completed->value])],
            'title' => ['nullable', 'string', 'max:120'],
        ];
    }
}
