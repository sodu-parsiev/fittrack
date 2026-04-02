import { formatMuscleGroup } from '../lib/muscleGroups';
import { formatWeightLabel } from '../lib/exerciseWeight';

export function SessionExerciseCard({
    draft,
    exercise,
    onChangeDraft,
    onCompleteSet,
    onDecreaseWeight,
    onIncreaseWeight,
    onRemoveExercise,
    onToggleSelfWeight,
    saving,
}) {
    const categoryLabel = exercise.categoryLabel ?? formatMuscleGroup(exercise.category);
    const nextSetNumber = exercise.completedSets + 1;

    return (
        <article className="exercise-card">
            <div className="exercise-card__header">
                <div className="exercise-card__heading">
                    <h3 className="exercise-card__title">{exercise.name}</h3>
                    <p className="exercise-card__subtitle">
                        {categoryLabel} · Ready for set {nextSetNumber}
                    </p>
                </div>
            </div>

            <div className="exercise-card__stats" aria-label={`${exercise.name} summary`}>
                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">Muscle group</span>
                    <strong className="exercise-card__stat-value">{categoryLabel}</strong>
                </div>

                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">Target reps</span>
                    <strong className="exercise-card__stat-value">{exercise.targetReps}</strong>
                </div>

                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">Next set</span>
                    <strong className="exercise-card__stat-value">{nextSetNumber}</strong>
                </div>

                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">Current load</span>
                    <strong className="exercise-card__stat-value">
                        {formatWeightLabel(exercise.currentWeight, exercise.usesSelfWeight)}
                    </strong>
                </div>
            </div>

            <div className="field exercise-card__mode">
                <span>Weight type</span>
                <div className="choice-row" role="group" aria-label={`${exercise.name} weight type`}>
                    <button
                        className={`choice-chip ${!exercise.usesSelfWeight ? 'choice-chip--active' : ''}`}
                        disabled={saving}
                        onClick={() => onToggleSelfWeight(exercise, false)}
                        type="button"
                    >
                        External weight
                    </button>
                    <button
                        className={`choice-chip ${exercise.usesSelfWeight ? 'choice-chip--active' : ''}`}
                        disabled={saving}
                        onClick={() => onToggleSelfWeight(exercise, true)}
                        type="button"
                    >
                        Self weight
                    </button>
                </div>
            </div>

            <div className="field-row exercise-card__inputs">
                <label className="field field--strong">
                    <span>Reps done</span>
                    <input
                        type="number"
                        min="1"
                        value={draft?.reps ?? exercise.targetReps}
                        onChange={(event) => onChangeDraft(exercise.id, 'reps', event.target.value)}
                    />
                </label>

                {exercise.usesSelfWeight ? (
                    <div className="field field--strong field--readonly">
                        <span>Load</span>
                        <div className="field__static field__static--strong">Self weight</div>
                    </div>
                ) : (
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
                )}
            </div>

            <div
                className={`exercise-card__actions ${exercise.usesSelfWeight ? 'exercise-card__actions--single' : ''}`}
                role="group"
                aria-label={`${exercise.name} actions`}
            >
                {!exercise.usesSelfWeight ? (
                    <button
                        className="button button--secondary button--compact"
                        disabled={saving}
                        onClick={() => onDecreaseWeight(exercise)}
                        type="button"
                    >
                        -2.5 kg
                    </button>
                ) : null}

                <button
                    className="button button--compact exercise-card__complete"
                    disabled={saving}
                    onClick={() => onCompleteSet(exercise)}
                    type="button"
                >
                    Complete set
                </button>

                {!exercise.usesSelfWeight ? (
                    <button
                        className="button button--secondary button--compact"
                        disabled={saving}
                        onClick={() => onIncreaseWeight(exercise)}
                        type="button"
                    >
                        +2.5 kg
                    </button>
                ) : null}
            </div>

            <div className="exercise-card__secondary">
                <button
                    className="button button--danger-soft button--compact button--auto"
                    disabled={saving}
                    onClick={() => onRemoveExercise(exercise)}
                    type="button"
                >
                    Delete exercise
                </button>
            </div>

            {exercise.sets.length > 0 ? (
                <ol className="set-list">
                    {exercise.sets.map((set) => (
                        <li key={set.id}>
                            Set {set.setNumber}: {set.reps} reps x {formatWeightLabel(set.weight, set.usesSelfWeight)}
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="empty-inline">No sets completed yet.</p>
            )}
        </article>
    );
}
