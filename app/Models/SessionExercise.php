<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MuscleGroup;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['workout_session_id', 'name', 'category', 'sort_order', 'current_weight', 'uses_self_weight', 'target_reps'])]
class SessionExercise extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'category' => MuscleGroup::class,
            'current_weight' => 'decimal:2',
            'uses_self_weight' => 'boolean',
        ];
    }

    public function workoutSession(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class);
    }

    public function exerciseSets(): HasMany
    {
        return $this->hasMany(ExerciseSet::class)->orderBy('set_number');
    }
}
