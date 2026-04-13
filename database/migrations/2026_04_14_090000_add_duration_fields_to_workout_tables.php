<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('session_exercises', function (Blueprint $table): void {
            $table->unsignedInteger('target_duration_seconds')->nullable()->after('target_reps');
        });

        Schema::table('exercise_sets', function (Blueprint $table): void {
            $table->unsignedInteger('duration_seconds')->nullable()->after('reps');
        });
    }

    public function down(): void
    {
        Schema::table('session_exercises', function (Blueprint $table): void {
            $table->dropColumn('target_duration_seconds');
        });

        Schema::table('exercise_sets', function (Blueprint $table): void {
            $table->dropColumn('duration_seconds');
        });
    }
};
