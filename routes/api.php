<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExerciseSetController;
use App\Http\Controllers\Api\SessionExerciseController;
use App\Http\Controllers\Api\WorkoutSessionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/sessions', [WorkoutSessionController::class, 'index']);
Route::post('/sessions', [WorkoutSessionController::class, 'store']);
Route::patch('/sessions/{session}', [WorkoutSessionController::class, 'update']);

Route::post('/sessions/{session}/exercises', [SessionExerciseController::class, 'store']);
Route::patch('/exercises/{exercise}', [SessionExerciseController::class, 'update']);
Route::delete('/exercises/{exercise}', [SessionExerciseController::class, 'destroy']);
Route::post('/exercises/{exercise}/sets', [ExerciseSetController::class, 'store']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
