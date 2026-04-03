import { formatMuscleGroup } from '../lib/muscleGroups';
import { formatWeightLabel } from '../lib/exerciseWeight';
import { useTranslation } from '../contexts/LanguageContext';

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
    const { language, t } = useTranslation();
    const categoryLabel = formatMuscleGroup(exercise.category, language);
    const nextSetNumber = exercise.completedSets + 1;

    return (
        <article className="exercise-card">
            <div className="exercise-card__header">
                <div className="exercise-card__heading">
                    <h3 className="exercise-card__title">{exercise.name}</h3>
                </div>
            </div>

            <div className="exercise-card__stats" aria-label={t('workout.exerciseSummary', { name: exercise.name })}>
                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">{t('exercise.muscleGroup')}</span>
                    <strong className="exercise-card__stat-value">{categoryLabel}</strong>
                </div>

                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">{t('exercise.targetReps')}</span>
                    <strong className="exercise-card__stat-value">{exercise.targetReps}</strong>
                </div>

                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">{t('exercise.nextSet')}</span>
                    <strong className="exercise-card__stat-value">{nextSetNumber}</strong>
                </div>

                <div className="exercise-card__stat">
                    <span className="exercise-card__stat-label">{t('exercise.currentLoad')}</span>
                    <strong className="exercise-card__stat-value">
                        {formatWeightLabel(exercise.currentWeight, exercise.usesSelfWeight, language)}
                    </strong>
                </div>
            </div>

            <div className="field exercise-card__mode">
                <span>{t('workout.weightType')}</span>
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

            <div
                className={`exercise-card__actions ${exercise.usesSelfWeight ? 'exercise-card__actions--single' : ''}`}
                aria-label={t('workout.exerciseActions', { name: exercise.name })}
                role="group"
            >
                {!exercise.usesSelfWeight ? (
                    <button
                        className="button button--secondary button--compact"
                        disabled={saving}
                        onClick={() => onDecreaseWeight(exercise)}
                        type="button"
                    >
                        {t('workout.adjustWeight', { unit: t('common.kg'), value: '-2.5' })}
                    </button>
                ) : null}

                <button
                    className="button button--compact exercise-card__complete"
                    disabled={saving}
                    onClick={() => onCompleteSet(exercise)}
                    type="button"
                >
                    {t('workout.completeSet')}
                </button>

                {!exercise.usesSelfWeight ? (
                    <button
                        className="button button--secondary button--compact"
                        disabled={saving}
                        onClick={() => onIncreaseWeight(exercise)}
                        type="button"
                    >
                        {t('workout.adjustWeight', { unit: t('common.kg'), value: '+2.5' })}
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
                    {t('workout.deleteExercise')}
                </button>
            </div>

            {exercise.sets.length > 0 ? (
                <ol className="set-list">
                    {exercise.sets.map((set) => (
                        <li key={set.id}>
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
