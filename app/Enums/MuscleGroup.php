<?php

declare(strict_types=1);

namespace App\Enums;

enum MuscleGroup: string
{
    case Biceps = 'biceps';
    case Triceps = 'triceps';
    case Back = 'back';
    case Legs = 'legs';
    case Chest = 'chest';
    case Shoulders = 'shoulders';
    case Cardio = 'cardio';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $group): string => $group->value,
            self::cases(),
        );
    }

    public function label(): string
    {
        return match ($this) {
            self::Biceps => 'Biceps',
            self::Triceps => 'Triceps',
            self::Back => 'Back',
            self::Legs => 'Legs',
            self::Chest => 'Chest',
            self::Shoulders => 'Shoulders',
            self::Cardio => 'Cardio',
        };
    }
}
