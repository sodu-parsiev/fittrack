export const MUSCLE_GROUP_OPTIONS = [
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'back', label: 'Back' },
    { value: 'legs', label: 'Legs' },
    { value: 'chest', label: 'Chest' },
    { value: 'shoulders', label: 'Shoulders' },
];

export function formatMuscleGroup(value) {
    return MUSCLE_GROUP_OPTIONS.find((group) => group.value === value)?.label ?? 'Uncategorized';
}
