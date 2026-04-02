<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\WorkoutSessionStatus;
use App\Models\SessionExercise;
use App\Models\User;
use App\Models\WorkoutSession;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WorkoutSessionService
{
    public function listSessions(User $user, ?WorkoutSessionStatus $status = null): Collection
    {
        return WorkoutSession::query()
            ->whereBelongsTo($user)
            ->when($status !== null, fn (Builder $query) => $query->where('status', $status->value))
            ->with([
                'sessionExercises' => fn ($query) => $query->orderBy('sort_order'),
                'sessionExercises.exerciseSets' => fn ($query) => $query->orderBy('set_number'),
            ])
            ->orderByDesc('started_at')
            ->get();
    }

    public function getOrCreateActiveSessionFor(User $user): WorkoutSession
    {
        return DB::transaction(function () use ($user): WorkoutSession {
            $session = WorkoutSession::query()
                ->whereBelongsTo($user)
                ->where('status', WorkoutSessionStatus::Active->value)
                ->lockForUpdate()
                ->first();

            if ($session instanceof WorkoutSession) {
                return $this->loadSession($session);
            }

            $session = $user->workoutSessions()->create([
                'status' => WorkoutSessionStatus::Active,
                'started_at' => now(),
            ]);

            return $this->loadSession($session);
        });
    }

    public function loadSession(WorkoutSession $session): WorkoutSession
    {
        return $session->load([
            'sessionExercises' => fn ($query) => $query->orderBy('sort_order'),
            'sessionExercises.exerciseSets' => fn ($query) => $query->orderBy('set_number'),
        ]);
    }

    /**
     * @param  array{name: string, category: mixed, current_weight?: mixed, uses_self_weight?: mixed, target_reps: mixed}  $attributes
     */
    public function createExercise(WorkoutSession $session, array $attributes): WorkoutSession
    {
        $this->ensureSessionIsActive($session);

        $usesSelfWeight = $this->toBoolean($attributes['uses_self_weight'] ?? false);

        $session->sessionExercises()->create([
            'name' => $attributes['name'],
            'category' => $attributes['category'],
            'sort_order' => ((int) $session->sessionExercises()->max('sort_order')) + 1,
            'current_weight' => $this->resolveStoredWeight($usesSelfWeight, $attributes['current_weight'] ?? 0),
            'uses_self_weight' => $usesSelfWeight,
            'target_reps' => $attributes['target_reps'],
        ]);

        return $this->loadSession($session->fresh());
    }

    /**
     * @param  array{name?: mixed, category?: mixed, current_weight?: mixed, uses_self_weight?: mixed, target_reps?: mixed}  $attributes
     */
    public function updateExercise(SessionExercise $exercise, array $attributes): WorkoutSession
    {
        $this->ensureSessionIsActive($exercise->workoutSession);

        $updates = $attributes;

        if (array_key_exists('uses_self_weight', $attributes)) {
            $updates['uses_self_weight'] = $this->toBoolean($attributes['uses_self_weight']);

            if ($updates['uses_self_weight']) {
                $updates['current_weight'] = 0;
            } elseif (array_key_exists('current_weight', $attributes)) {
                $updates['current_weight'] = $this->resolveStoredWeight(false, $attributes['current_weight'] ?? 0);
            }
        } elseif (array_key_exists('current_weight', $attributes)) {
            $updates['current_weight'] = $this->resolveStoredWeight((bool) $exercise->uses_self_weight, $attributes['current_weight'] ?? 0);
        }

        $exercise->fill($updates);
        $exercise->save();

        return $this->loadSession($exercise->workoutSession->fresh());
    }

    public function deleteExercise(SessionExercise $exercise): WorkoutSession
    {
        $session = $exercise->workoutSession;

        $this->ensureSessionIsActive($session);

        DB::transaction(function () use ($exercise, $session): void {
            $exercise->delete();

            $remaining = $session->sessionExercises()->orderBy('sort_order')->get();

            foreach ($remaining as $index => $item) {
                $item->update(['sort_order' => $index + 1]);
            }
        });

        return $this->loadSession($session->fresh());
    }

    /**
     * @param  array{reps: mixed, weight?: mixed, uses_self_weight?: mixed}  $attributes
     */
    public function addSet(SessionExercise $exercise, array $attributes): WorkoutSession
    {
        $session = $exercise->workoutSession;

        $this->ensureSessionIsActive($session);

        DB::transaction(function () use ($exercise, $attributes): void {
            $usesSelfWeight = array_key_exists('uses_self_weight', $attributes)
                ? $this->toBoolean($attributes['uses_self_weight'])
                : (bool) $exercise->uses_self_weight;
            $storedWeight = $this->resolveStoredWeight($usesSelfWeight, $attributes['weight'] ?? 0);

            $exercise->update([
                'current_weight' => $storedWeight,
                'uses_self_weight' => $usesSelfWeight,
            ]);

            $exercise->exerciseSets()->create([
                'set_number' => ((int) $exercise->exerciseSets()->max('set_number')) + 1,
                'reps' => $attributes['reps'],
                'weight' => $storedWeight,
                'uses_self_weight' => $usesSelfWeight,
                'completed_at' => now(),
            ]);
        });

        return $this->loadSession($session->fresh());
    }

    public function completeSession(WorkoutSession $session, ?string $title = null): WorkoutSession
    {
        $this->ensureSessionIsActive($session);

        $session->update([
            'status' => WorkoutSessionStatus::Completed,
            'title' => $title ?: Str::of('Workout '.$session->started_at?->format('M j, Y'))->trim()->toString(),
            'ended_at' => now(),
        ]);

        return $this->loadSession($session->fresh());
    }

    private function ensureSessionIsActive(WorkoutSession $session): void
    {
        if (! $session->isActive()) {
            throw ValidationException::withMessages([
                'session' => 'Completed workouts cannot be modified.',
            ]);
        }
    }

    private function resolveStoredWeight(bool $usesSelfWeight, mixed $weight): float
    {
        return $usesSelfWeight ? 0.0 : (float) ($weight ?? 0);
    }

    private function toBoolean(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
