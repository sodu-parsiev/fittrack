import { translate } from './i18n';

export const MUSCLE_GROUP_OPTIONS = [
    { value: 'biceps' },
    { value: 'triceps' },
    { value: 'back' },
    { value: 'legs' },
    { value: 'chest' },
    { value: 'shoulders' },
    { value: 'cardio' },
];

export function formatMuscleGroup(value, language = 'en') {
    if (!MUSCLE_GROUP_OPTIONS.some((group) => group.value === value)) {
        return translate(language, 'muscleGroups.uncategorized');
    }

    return translate(language, `muscleGroups.${value}`);
}

export function getMuscleGroupOptions(language = 'en') {
    return MUSCLE_GROUP_OPTIONS.map((group) => ({
        ...group,
        label: formatMuscleGroup(group.value, language),
    }));
}
