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
            $table->boolean('uses_self_weight')->default(false)->after('current_weight');
        });

        Schema::table('exercise_sets', function (Blueprint $table): void {
            $table->boolean('uses_self_weight')->default(false)->after('weight');
        });
    }

    public function down(): void
    {
        Schema::table('session_exercises', function (Blueprint $table): void {
            $table->dropColumn('uses_self_weight');
        });

        Schema::table('exercise_sets', function (Blueprint $table): void {
            $table->dropColumn('uses_self_weight');
        });
    }
};
