import { formatMuscleGroup } from '../lib/muscleGroups';
import { useTranslation } from '../contexts/LanguageContext';

export function SessionExerciseCard({
    draft,
    exercise,
    isCurrentExercise,
    onChangeDraft,
    onCompleteSet,
    onRemoveExercise,
    onToggleSelfWeight,
    saving,
}) {
    const { language, t } = useTranslation();
    const categoryLabel = formatMuscleGroup(exercise.category, language);
    const completedSets = exercise.sets.length;
    const totalSegments = Math.max(completedSets + 4, 12);
    const summaryLine = `${exercise.name} / ${categoryLabel} / ${exercise.targetReps} / ${completedSets}`;

    return (
        <article className="exercise-card exercise-card--active">
            <div className="exercise-card__header">
                <div className="exercise-card__heading">
                    <h3 className="exercise-card__summary-line">{summaryLine}</h3>
                    <hr className="line-under-title"/>
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
                {!isCurrentExercise ? (
                    <button
                        className="button button--compact button--danger-soft exercise-card__delete"
                        disabled={saving}
                        onClick={() => onRemoveExercise(exercise)}
                        type="button"
                    >
                        {t('workout.deleteExercise')}
                    </button>
                ) : null}
            </div>

            {completedSets > 0 ? (
                <div className="set-progress" aria-label={t('workout.sets')}>
                    {Array.from({ length: totalSegments }).map((_, index) => (
                        <span
                            className={`set-progress__segment ${index < completedSets ? 'set-progress__segment--done' : ''}`}
                            key={`${exercise.id}-segment-${index}`}
                        />
                    ))}
                </div>
            ) : null}
        </article>
    );
}
