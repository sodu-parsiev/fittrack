<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_sets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('session_exercise_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('set_number');
            $table->unsignedInteger('reps');
            $table->decimal('weight', 6, 2);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['session_exercise_id', 'set_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_sets');
    }
};
