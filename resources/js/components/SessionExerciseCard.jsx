import { formatMuscleGroup } from '../lib/muscleGroups';

function formatWeight(value) {
    const numeric = Number(value ?? 0);

    if (Number.isInteger(numeric)) {
        return numeric.toString();
    }

    return numeric.toFixed(2).replace(/\.?0+$/, '');
}

export function SessionExerciseCard({
    draft,
    exercise,
    onChangeDraft,
    onCompleteSet,
    onDecreaseWeight,
    onIncreaseWeight,
    onRemoveExercise,
    saving,
}) {
    return (
        <article className="exercise-card">
            <div className="exercise-card__header">
                <div>
                    <h3 className="exercise-card__title">{exercise.name}</h3>
                    <p className="exercise-card__subtitle">
                        {exercise.categoryLabel ?? formatMuscleGroup(exercise.category)} · Current weight{' '}
                        <strong>{formatWeight(exercise.currentWeight)} kg</strong>
                    </p>
                </div>

                <div className="badge-row">
                    <span className="badge">{exercise.categoryLabel ?? formatMuscleGroup(exercise.category)}</span>
                    <span className="badge">Target {exercise.targetReps} reps</span>
                    <span className="badge">Sets {exercise.completedSets}</span>
                </div>
            </div>

            <div className="exercise-card__metrics">
                <div className="exercise-card__metric">
                    <span className="exercise-card__metric-label">Target reps</span>
                    <strong className="exercise-card__metric-value">{exercise.targetReps}</strong>
                </div>

                <div className="exercise-card__metric">
                    <span className="exercise-card__metric-label">Current weight</span>
                    <strong className="exercise-card__metric-value">{formatWeight(exercise.currentWeight)} kg</strong>
                </div>
            </div>

            <div className="field-row">
                <label className="field field--strong">
                    <span>Reps done</span>
                    <input
                        type="number"
                        min="1"
                        value={draft?.reps ?? exercise.targetReps}
                        onChange={(event) => onChangeDraft(exercise.id, 'reps', event.target.value)}
                    />
                </label>

                <label className="field field--strong">
                    <span>Weight</span>
                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={draft?.weight ?? exercise.currentWeight}
                        onChange={(event) => onChangeDraft(exercise.id, 'weight', event.target.value)}
                    />
                </label>
            </div>

            <button
                className="button"
                disabled={saving}
                onClick={() => onCompleteSet(exercise)}
                type="button"
            >
                Complete set
            </button>

            <div className="button-row">
                <button
                    className="button button--secondary"
                    disabled={saving}
                    onClick={() => onIncreaseWeight(exercise)}
                    type="button"
                >
                    +2.5 kg
                </button>
                <button
                    className="button button--secondary"
                    disabled={saving}
                    onClick={() => onDecreaseWeight(exercise)}
                    type="button"
                >
                    -2.5 kg
                </button>
            </div>

            <button
                className="button button--danger"
                disabled={saving}
                onClick={() => onRemoveExercise(exercise)}
                type="button"
            >
                Delete exercise
            </button>

            {exercise.sets.length > 0 ? (
                <ol className="set-list">
                    {exercise.sets.map((set) => (
                        <li key={set.id}>
                            Set {set.setNumber}: {set.reps} reps x {formatWeight(set.weight)} kg
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="empty-inline">No sets completed yet.</p>
            )}
        </article>
    );
}
