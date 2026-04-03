import { formatMuscleGroup } from '../lib/muscleGroups';
import { formatWeightLabel } from '../lib/exerciseWeight';
import { useTranslation } from '../contexts/LanguageContext';

export function SessionExerciseCard({
    draft,
    exercise,
    onChangeDraft,
    onCompleteSet,
    onRemoveExercise,
    onToggleSelfWeight,
    saving,
}) {
    const { language, t } = useTranslation();
    const categoryLabel = formatMuscleGroup(exercise.category, language);
    const summaryLine = `${exercise.name}/${categoryLabel}/${exercise.targetReps}/${exercise.sets.length}`;

    return (
        <article className="exercise-card exercise-card--active">
            <div className="exercise-card__header">
                <div className="exercise-card__heading">
                    <p className="exercise-card__summary-line">{summaryLine}</p>
                </div>
            </div>

            <div className="field exercise-card__mode">
                <div className="choice-row" role="group" aria-label={t('workout.exerciseWeightType', { name: exercise.name })}>
                    <button
                        className={`choice-chip ${!exercise.usesSelfWeight ? 'choice-chip--active' : ''}`}
                        disabled={saving}
                        onClick={() => onToggleSelfWeight(exercise, false)}
                        type="button"
                    >
                        {t('workout.externalWeight')}
                    </button>
                    <button
                        className={`choice-chip ${exercise.usesSelfWeight ? 'choice-chip--active' : ''}`}
                        disabled={saving}
                        onClick={() => onToggleSelfWeight(exercise, true)}
                        type="button"
                    >
                        {t('workout.selfWeight')}
                    </button>
                </div>
            </div>

            <div className="field-row exercise-card__inputs">
                <label className="field field--strong">
                    <span>{t('workout.repsDone')}</span>
                    <input
                        autoComplete="off"
                        id={`exercise-${exercise.id}-reps`}
                        inputMode="numeric"
                        type="number"
                        min="1"
                        name={`exerciseReps-${exercise.id}`}
                        value={draft?.reps ?? exercise.targetReps}
                        onChange={(event) => onChangeDraft(exercise.id, 'reps', event.target.value)}
                    />
                </label>

                {exercise.usesSelfWeight ? (
                    <div className="field field--strong field--readonly">
                        <span>{t('workout.load')}</span>
                        <div className="field__static field__static--strong">{t('workout.selfWeight')}</div>
                    </div>
                ) : (
                    <label className="field field--strong">
                        <span>{t('workout.weight')}</span>
                        <input
                            autoComplete="off"
                            id={`exercise-${exercise.id}-weight`}
                            inputMode="decimal"
                            type="number"
                            min="0"
                            name={`exerciseWeight-${exercise.id}`}
                            step="0.5"
                            value={draft?.weight ?? exercise.currentWeight}
                            onChange={(event) => onChangeDraft(exercise.id, 'weight', event.target.value)}
                        />
                    </label>
                )}
            </div>

            <div className="exercise-card__actions exercise-card__actions--single" aria-label={t('workout.exerciseActions', { name: exercise.name })} role="group">
                <button
                    className="button button--compact exercise-card__complete"
                    disabled={saving}
                    onClick={() => onCompleteSet(exercise)}
                    type="button"
                >
                    {t('workout.completeSet')}
                </button>
            </div>

            {exercise.sets.length > 0 ? (
                <div className="exercise-card__secondary">
                    <button
                        className="button button--danger-soft button--compact button--auto"
                        disabled={saving}
                        onClick={() => onRemoveExercise(exercise)}
                        type="button"
                    >
                        {t('workout.deleteExercise')}
                    </button>
                </div>
            ) : null}

            {exercise.sets.length > 0 ? (
                <ol className="set-progress">
                    {exercise.sets.map((set, index) => (
                        <li
                            key={set.id}
                            style={{ '--set-progress': `${((index + 1) / exercise.sets.length) * 100}%` }}
                        >
                            {t('exercise.setEntry', {
                                number: set.setNumber,
                                reps: set.reps,
                                weight: formatWeightLabel(set.weight, set.usesSelfWeight, language),
                            })}
                        </li>
                    ))}
                </ol>
            ) : null}
        </article>
    );
}
