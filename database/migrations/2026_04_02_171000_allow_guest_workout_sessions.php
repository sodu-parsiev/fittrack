<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workout_sessions', function (Blueprint $table): void {
            $table->foreignId('user_id')->nullable()->change();
            $table->uuid('guest_token')->nullable()->after('user_id')->index();
            $table->index(['guest_token', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('workout_sessions', function (Blueprint $table): void {
            $table->dropIndex(['guest_token', 'status']);
            $table->dropColumn('guest_token');
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
