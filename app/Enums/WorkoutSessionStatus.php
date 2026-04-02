<?php

declare(strict_types=1);

namespace App\Enums;

enum WorkoutSessionStatus: string
{
    case Active = 'active';
    case Completed = 'completed';
}
