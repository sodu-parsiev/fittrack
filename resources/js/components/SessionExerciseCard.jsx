import { formatMuscleGroup } from '../lib/muscleGroups';
import { useTranslation } from '../contexts/LanguageContext';
import { formatDurationSecondsToMMSS } from '../lib/duration';

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
    const isCardio = exercise.category === 'cardio';
    const completedSets = exercise.sets.length;
    const totalSegments = Math.max(completedSets + 4, 12);
    const targetMetric = isCardio
        ? formatDurationSecondsToMMSS(exercise.targetDurationSeconds ?? 0)
        : exercise.targetReps;
    const summaryLine = `${exercise.name} / ${categoryLabel} / ${targetMetric} / ${completedSets}`;

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
                    <span>{isCardio ? t('workout.timeDone') : t('workout.repsDone')}</span>
                    <input
                        autoComplete="off"
                        id={`exercise-${exercise.id}-${isCardio ? 'duration' : 'reps'}`}
                        inputMode={isCardio ? 'text' : 'numeric'}
                        type={isCardio ? 'text' : 'number'}
                        min={isCardio ? undefined : '1'}
                        name={`exercise${isCardio ? 'Duration' : 'Reps'}-${exercise.id}`}
                        placeholder={isCardio ? 'MM:SS' : undefined}
                        value={isCardio ? (draft?.duration ?? formatDurationSecondsToMMSS(exercise.targetDurationSeconds ?? 0)) : (draft?.reps ?? exercise.targetReps)}
                        onChange={(event) => onChangeDraft(exercise.id, isCardio ? 'duration' : 'reps', event.target.value)}
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
