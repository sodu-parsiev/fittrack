<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\SessionExercise;
use App\Models\User;
use App\Models\WorkoutSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutSessionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_run_the_full_workout_flow(): void
    {
        $user = User::factory()->create();

        $sessionResponse = $this->actingAs($user, 'sanctum')
            ->postJson('/api/sessions');

        $sessionResponse
            ->assertSuccessful()
            ->assertJsonPath('status', 'active');

        $sessionId = $sessionResponse->json('id');

        $exerciseResponse = $this->actingAs($user, 'sanctum')
            ->postJson("/api/sessions/{$sessionId}/exercises", [
                'name' => 'Smith Bench',
                'category' => 'chest',
                'current_weight' => 60,
                'target_reps' => 8,
            ]);

        $exerciseResponse
            ->assertOk()
            ->assertJsonPath('exerciseCount', 1)
            ->assertJsonPath('exercises.0.name', 'Smith Bench')
            ->assertJsonPath('exercises.0.category', 'chest');

        $exerciseId = $exerciseResponse->json('exercises.0.id');

        $setResponse = $this->actingAs($user, 'sanctum')
            ->postJson("/api/exercises/{$exerciseId}/sets", [
                'reps' => 8,
                'weight' => 62.5,
            ]);

        $setResponse
            ->assertOk()
            ->assertJsonPath('totalSets', 1)
            ->assertJsonPath('exercises.0.currentWeight', 62.5)
            ->assertJsonPath('exercises.0.sets.0.weight', 62.5);

        $historyResponse = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/sessions/{$sessionId}", [
                'status' => 'completed',
            ]);

        $historyResponse
            ->assertOk()
            ->assertJsonPath('status', 'completed')
            ->assertJsonPath('exerciseCount', 1);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/sessions?status=completed')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.totalSets', 1)
            ->assertJsonPath('0.exercises.0.category', 'chest');
    }

    public function test_completed_session_cannot_be_modified(): void
    {
        $user = User::factory()->create();
        $session = WorkoutSession::query()->create([
            'user_id' => $user->id,
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'ended_at' => now(),
        ]);
        $exercise = SessionExercise::query()->create([
            'workout_session_id' => $session->id,
            'name' => 'Deadlift',
            'category' => 'legs',
            'sort_order' => 1,
            'current_weight' => 120,
            'target_reps' => 5,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/exercises/{$exercise->id}/sets", [
                'reps' => 5,
                'weight' => 120,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['session']);
    }

    public function test_user_cannot_access_another_users_exercises(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $session = WorkoutSession::query()->create([
            'user_id' => $owner->id,
            'status' => 'active',
            'started_at' => now(),
        ]);
        $exercise = SessionExercise::query()->create([
            'workout_session_id' => $session->id,
            'name' => 'Row',
            'category' => 'back',
            'sort_order' => 1,
            'current_weight' => 50,
            'target_reps' => 10,
        ]);

        $this->actingAs($intruder, 'sanctum')
            ->patchJson("/api/exercises/{$exercise->id}", [
                'current_weight' => 55,
            ])
            ->assertNotFound();
    }

    public function test_exercise_creation_requires_a_muscle_group_category(): void
    {
        $user = User::factory()->create();
        $session = WorkoutSession::query()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'started_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/sessions/{$session->id}/exercises", [
                'name' => 'Cable Curl',
                'current_weight' => 20,
                'target_reps' => 12,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category']);
    }
}
