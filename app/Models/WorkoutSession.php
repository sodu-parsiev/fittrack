<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WorkoutSessionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'title', 'status', 'started_at', 'ended_at'])]
class WorkoutSession extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'status' => WorkoutSessionStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessionExercises(): HasMany
    {
        return $this->hasMany(SessionExercise::class)->orderBy('sort_order');
    }

    public function isActive(): bool
    {
        return $this->status === WorkoutSessionStatus::Active;
    }
}
