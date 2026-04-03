import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../bootstrap';
import { SessionExerciseCard } from '../components/SessionExerciseCard';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { getErrorMessage } from '../lib/errors';
import { getMuscleGroupOptions } from '../lib/muscleGroups';

const TIMER_START_SECONDS = 60;
const TIMER_OVERDUE_LIMIT_SECONDS = -180;
const TIMER_SOUND = 'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

function IconBase({ children }) {
    return (
        <svg aria-hidden="true" className="button__icon" fill="none" viewBox="0 0 24 24">
            {children}
        </svg>
    );
}

function PlayIcon() {
    return (
        <IconBase>
            <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
        </IconBase>
    );
}

function ResetIcon() {
    return (
        <IconBase>
            <path
                d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </IconBase>
    );
}

function ArrowUpIcon() {
    return (
        <IconBase>
            <path
                d="m7 13 5-5 5 5M12 8v8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </IconBase>
    );
}

function ArrowDownIcon() {
    return (
        <IconBase>
            <path
                d="m7 11 5 5 5-5M12 8v8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </IconBase>
    );
}

function FlagIcon() {
    return (
        <IconBase>
            <path
                d="M6 4v16M6 5h9l-1.5 3L15 11H6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </IconBase>
    );
}

function PlusIcon() {
    return (
        <IconBase>
            <path
                d="M12 6v12M6 12h12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </IconBase>
    );
}

function playTimerSound() {
    try {
        const audio = new Audio(TIMER_SOUND);
        audio.play();
    } catch {
        // Ignore audio failures in browsers that block autoplay.
    }
}

function formatSessionStartTime(value, locale, fallbackLabel) {
    if (!value) {
        return fallbackLabel;
    }

    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(value));
}

function formatTimerValue(value) {
    const totalSeconds = Math.trunc(Number(value) || 0);
    const absoluteSeconds = Math.abs(totalSeconds);
    const minutes = Math.floor(absoluteSeconds / 60);
    const seconds = absoluteSeconds % 60;
    const prefix = totalSeconds < 0 ? '-' : '';

    return `${prefix}${minutes}:${String(seconds).padStart(2, '0')}`;
}

function buildDraftSet(exercise, currentDraft = null) {
    return {
        reps: currentDraft?.reps ?? String(exercise.targetReps),
        weight: currentDraft?.weight ?? String(exercise.currentWeight),
    };
}

function resetDraftAfterSet(exercise, currentDraft = null) {
    return {
        reps: String(exercise.targetReps),
        weight: exercise.usesSelfWeight ? currentDraft?.weight ?? String(exercise.currentWeight) : String(exercise.currentWeight),
    };
}

export function WorkoutPage() {
    const navigate = useNavigate();
    const { language, locale, t } = useTranslation();
    const { user } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [draftSets, setDraftSets] = useState({});
    const [exerciseForm, setExerciseForm] = useState({
        name: '',
        category: '',
        usesSelfWeight: false,
        currentWeight: '',
        targetReps: '8',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(TIMER_START_SECONDS);
    const [timerRunning, setTimerRunning] = useState(false);
    const addExerciseRef = useRef(null);

    useEffect(() => {
        loadActiveSession();
    }, []);

    useEffect(() => {
        if (!activeSession) {
            setDraftSets({});
            return;
        }

        setDraftSets((current) => {
            const next = {};

            activeSession.exercises.forEach((exercise) => {
                next[exercise.id] = buildDraftSet(exercise, current[exercise.id]);
            });

            return next;
        });
    }, [activeSession]);

    useEffect(() => {
        if (!timerRunning) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setTimeLeft((current) => {
                if (current === 1) {
                    playTimerSound();
                }

                if (current <= TIMER_OVERDUE_LIMIT_SECONDS) {
                    window.clearInterval(interval);
                    setTimerRunning(false);
                    return TIMER_OVERDUE_LIMIT_SECONDS;
                }

                return current - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [timerRunning]);

    async function loadActiveSession() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/api/sessions', {
                params: { status: 'active' },
            });

            setActiveSession(response.data[0] ?? null);
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToLoadCurrent')));
        } finally {
            setLoading(false);
        }
    }

    async function startWorkout() {
        setSaving(true);
        setError('');

        try {
            const response = await api.post('/api/sessions');
            setActiveSession(response.data);
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToStart')));
        } finally {
            setSaving(false);
        }
    }

    async function handleAddExercise(event) {
        event.preventDefault();

        if (!activeSession) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const response = await api.post(`/api/sessions/${activeSession.id}/exercises`, {
                name: exerciseForm.name.trim(),
                category: exerciseForm.category,
                uses_self_weight: exerciseForm.usesSelfWeight,
                current_weight: exerciseForm.usesSelfWeight ? null : Number(exerciseForm.currentWeight || 0),
                target_reps: Number(exerciseForm.targetReps || 8),
            });

            setActiveSession(response.data);
            setExerciseForm({
                name: '',
                category: '',
                usesSelfWeight: false,
                currentWeight: '',
                targetReps: '8',
            });
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToAddExercise')));
        } finally {
            setSaving(false);
        }
    }

    function handleDraftChange(exerciseId, field, value) {
        setDraftSets((current) => ({
            ...current,
            [exerciseId]: {
                ...current[exerciseId],
                [field]: value,
            },
        }));
    }

    async function updateExerciseWeightType(exercise, usesSelfWeight) {
        if (exercise.usesSelfWeight === usesSelfWeight) {
            return;
        }

        const draft = draftSets[exercise.id];

        setSaving(true);
        setError('');

        try {
            const response = await api.patch(`/api/exercises/${exercise.id}`, {
                uses_self_weight: usesSelfWeight,
                current_weight: usesSelfWeight ? 0 : Number(draft?.weight || exercise.currentWeight || 0),
            });

            const updatedSession = response.data;
            const updatedExercise = updatedSession.exercises.find((item) => item.id === exercise.id);

            setActiveSession(updatedSession);
            setDraftSets((current) => ({
                ...current,
                [exercise.id]: buildDraftSet(updatedExercise ?? exercise, current[exercise.id]),
            }));
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToUpdateWeightType')));
        } finally {
            setSaving(false);
        }
    }

    async function completeSet(exercise) {
        const draft = draftSets[exercise.id] ?? buildDraftSet(exercise);

        setSaving(true);
        setError('');

        try {
            const payload = {
                reps: Number(draft.reps),
                uses_self_weight: exercise.usesSelfWeight,
            };

            if (!exercise.usesSelfWeight) {
                payload.weight = Number(draft.weight);
            }

            const response = await api.post(`/api/exercises/${exercise.id}/sets`, payload);

            const updatedSession = response.data;
            const updatedExercise = updatedSession.exercises.find((item) => item.id === exercise.id);

            setActiveSession(updatedSession);
            setDraftSets((current) => ({
                ...current,
                [exercise.id]: resetDraftAfterSet(updatedExercise ?? exercise, current[exercise.id]),
            }));
            startTimer();
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToSaveSet')));
        } finally {
            setSaving(false);
        }
    }

    async function removeExercise(exercise) {
        if (!window.confirm(t('workout.deleteExerciseConfirm', { name: exercise.name }))) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const response = await api.delete(`/api/exercises/${exercise.id}`);
            setActiveSession(response.data);
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToRemoveExercise')));
        } finally {
            setSaving(false);
        }
    }

    async function finishWorkout() {
        if (!activeSession) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            await api.patch(`/api/sessions/${activeSession.id}`, {
                status: 'completed',
            });

            setActiveSession(null);
            if (user) {
                navigate('/app/history');
            }
        } catch (requestError) {
            setError(getErrorMessage(requestError, t('workout.unableToFinish')));
        } finally {
            setSaving(false);
        }
    }

    function startTimer() {
        setTimeLeft(TIMER_START_SECONDS);
        setTimerRunning(true);
    }

    function resetTimer() {
        setTimerRunning(false);
        setTimeLeft(TIMER_START_SECONDS);
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    function scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
        });
    }

    function scrollToAddExercise() {
        addExerciseRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    if (loading) {
        return (
            <section className="panel">
                <div className="panel__header">
                    <h2 className="panel__title">{t('common.loading')}</h2>
                </div>
            </section>
        );
    }

    const timerCanReset = timerRunning || timeLeft !== TIMER_START_SECONDS;
    const timerDisplayLabel = formatTimerValue(timeLeft);
    const muscleGroupOptions = getMuscleGroupOptions(language);
    const currentExerciseId = activeSession?.exercises?.[activeSession.exercises.length - 1]?.id ?? null;
    const orderedExercises = useMemo(() => {
        if (!activeSession?.exercises?.length) {
            return [];
        }

        if (currentExerciseId === null) {
            return activeSession.exercises;
        }

        return [...activeSession.exercises].sort((left, right) => {
            if (left.id === currentExerciseId) {
                return -1;
            }

            if (right.id === currentExerciseId) {
                return 1;
            }

            return 0;
        });
    }, [activeSession?.exercises, currentExerciseId]);

    return (
        <div className={`stack stack--page workout-page ${activeSession ? 'stack--page-with-utility' : ''}`.trim()}>
            {activeSession ? (
                <section className="floating-timer" aria-label={t('workout.restTimer')}>
                    <div className="floating-timer__display" aria-live="polite">
                        {timerDisplayLabel}
                    </div>

                    <div className="floating-timer__actions" role="group" aria-label={t('workout.restTimerControls')}>
                        <button
                            className="button button--compact floating-timer__button"
                            disabled={timerRunning}
                            onClick={startTimer}
                            type="button"
                        >
                            {t('workout.start')}
                        </button>
                        <button
                            className="button button--danger-soft button--compact floating-timer__button"
                            disabled={!timerCanReset}
                            onClick={resetTimer}
                            type="button"
                        >
                            {t('workout.reset')}
                        </button>
                        <button
                            aria-label={t('workout.scrollToAddExercise')}
                            className="button button--secondary button--compact floating-timer__button"
                            onClick={scrollToAddExercise}
                            type="button"
                        >
                            +
                        </button>
                    </div>
                </section>
            ) : null}

            {error ? <p className="status-banner status-banner--error">{error}</p> : null}

            {!activeSession ? (
                <section className="panel empty-state">
                    <button className="button" disabled={saving} onClick={startWorkout} type="button">
                        <PlayIcon />
                        <span>{saving ? t('workout.starting') : t('workout.startWorkout')}</span>
                    </button>
                </section>
            ) : (
                <>
                    {activeSession.exercises.length > 0 ? (
                        <div className="exercise-list">
                            {orderedExercises.map((exercise) => (
                                <SessionExerciseCard
                                    key={exercise.id}
                                    draft={draftSets[exercise.id]}
                                    exercise={exercise}
                                    isCurrentExercise={exercise.id === currentExerciseId}
                                    onChangeDraft={handleDraftChange}
                                    onCompleteSet={completeSet}
                                    onRemoveExercise={removeExercise}
                                    onToggleSelfWeight={updateExerciseWeightType}
                                    saving={saving}
                                />
                            ))}
                        </div>
                    ) : null}

                    <section className="session-started session-started--inline" aria-label={t('workout.summary')}>
                        <div className="session-started__meta">
                            <span className="session-started__label">STARTED:</span>
                            <strong className="session-started__value">
                                {formatSessionStartTime(activeSession.startedAt, locale, t('common.justNow'))}
                            </strong>
                        </div>
                        <span aria-hidden="true" className="session-started__separator">|</span>
                        <button
                            className="button button--secondary button--auto"
                            disabled={saving}
                            onClick={finishWorkout}
                            type="button"
                        >
                            <FlagIcon />
                            <span>{t('workout.finishWorkout')}</span>
                        </button>
                    </section>

                    <section className="panel" ref={addExerciseRef}>
                        <form autoComplete="off" className="stack" onSubmit={handleAddExercise}>
                            <label className="field">
                                <span>{t('workout.exerciseName')}</span>
                                <input
                                    autoCapitalize="words"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    id="exercise-label-input"
                                    inputMode="text"
                                    name="exerciseLabel"
                                    required
                                    spellCheck={false}
                                    type="text"
                                    placeholder={t('workout.exercisePlaceholder')}
                                    value={exerciseForm.name}
                                    onChange={(event) => setExerciseForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))}
                                />
                            </label>

                            <label className="field">
                                <span>{t('workout.muscleGroup')}</span>
                                <select
                                    autoComplete="off"
                                    id="exercise-muscle-group-select"
                                    name="exerciseGroup"
                                    required
                                    value={exerciseForm.category}
                                    onChange={(event) => setExerciseForm((current) => ({
                                        ...current,
                                        category: event.target.value,
                                    }))}
                                >
                                    <option disabled value="">{t('workout.chooseMuscleGroup')}</option>
                                    {muscleGroupOptions.map((group) => (
                                        <option key={group.value} value={group.value}>
                                            {group.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="field">
                                <span>{t('workout.weightType')}</span>
                                <div className="choice-row" role="group" aria-label={t('workout.weightType')}>
                                    <button
                                        className={`choice-chip ${!exerciseForm.usesSelfWeight ? 'choice-chip--active' : ''}`}
                                        onClick={() => setExerciseForm((current) => ({
                                            ...current,
                                            usesSelfWeight: false,
                                        }))}
                                        type="button"
                                    >
                                        {t('workout.externalWeight')}
                                    </button>
                                    <button
                                        className={`choice-chip ${exerciseForm.usesSelfWeight ? 'choice-chip--active' : ''}`}
                                        onClick={() => setExerciseForm((current) => ({
                                            ...current,
                                            usesSelfWeight: true,
                                        }))}
                                        type="button"
                                    >
                                        {t('workout.selfWeight')}
                                    </button>
                                </div>
                            </div>

                            <div className="field-row workout-form__pair">
                                <label className="field">
                                    <span>{t('workout.weightKg', { unit: t('common.kg') })}</span>
                                    <input
                                        autoComplete="off"
                                        disabled={exerciseForm.usesSelfWeight}
                                        id="exercise-load-input"
                                        inputMode="decimal"
                                        min="0"
                                        name="exerciseLoad"
                                        step="0.5"
                                        type="number"
                                        value={exerciseForm.currentWeight}
                                        onChange={(event) => setExerciseForm((current) => ({
                                            ...current,
                                            currentWeight: event.target.value,
                                        }))}
                                    />
                                </label>

                                <label className="field">
                                    <span>{t('workout.targetReps')}</span>
                                    <input
                                        autoComplete="off"
                                        id="exercise-target-reps-input"
                                        inputMode="numeric"
                                        min="1"
                                        name="exerciseTargetReps"
                                        type="number"
                                        value={exerciseForm.targetReps}
                                        onChange={(event) => setExerciseForm((current) => ({
                                            ...current,
                                            targetReps: event.target.value,
                                        }))}
                                    />
                                </label>
                            </div>

                            <button className="button" disabled={saving} type="submit">
                                {saving ? t('workout.saving') : t('workout.addExerciseButton')}
                            </button>
                        </form>
                    </section>
                </>
            )}

            {activeSession ? (
                <>
                    <div className="scroll-dock" aria-label={t('workout.scrollControls')}>
                        <button className="scroll-dock__button" onClick={scrollToTop} type="button">
                            {t('workout.top')}
                        </button>
                        <button className="scroll-dock__button" onClick={scrollToBottom} type="button">
                            {t('workout.bottom')}
                        </button>
                    </div>

                    <section className="workout-utility-bar" aria-label={t('workout.workoutUtilities')}>
                        <div className="workout-utility-bar__row">
                            <div className="workout-utility-bar__display" aria-live="polite">
                                {timerDisplayLabel}
                            </div>

                            <div className="workout-utility-bar__controls" role="group" aria-label={t('workout.workoutUtilities')}>
                                <button
                                    aria-label={t('workout.startTimer')}
                                    className="button button--compact button--icon-only workout-utility-bar__button"
                                    disabled={timerRunning}
                                    onClick={startTimer}
                                    title={t('workout.startTimer')}
                                    type="button"
                                >
                                    <PlayIcon />
                                </button>
                                <button
                                    aria-label={t('workout.resetTimer')}
                                    className="button button--danger-soft button--compact button--icon-only workout-utility-bar__button"
                                    disabled={!timerCanReset}
                                    onClick={resetTimer}
                                    title={t('workout.resetTimer')}
                                    type="button"
                                >
                                    <ResetIcon />
                                </button>
                                <button
                                    aria-label={t('workout.scrollToTop')}
                                    className="button button--ghost button--compact button--icon-only workout-utility-bar__button"
                                    onClick={scrollToTop}
                                    title={t('workout.top')}
                                    type="button"
                                >
                                    <ArrowUpIcon />
                                </button>
                                <button
                                    aria-label={t('workout.scrollToBottom')}
                                    className="button button--ghost button--compact button--icon-only workout-utility-bar__button"
                                    onClick={scrollToBottom}
                                    title={t('workout.bottom')}
                                    type="button"
                                >
                                    <ArrowDownIcon />
                                </button>
                                <button
                                    aria-label={t('workout.scrollToAddExercise')}
                                    className="button button--secondary button--compact button--icon-only workout-utility-bar__button"
                                    onClick={scrollToAddExercise}
                                    title={t('workout.scrollToAddExercise')}
                                    type="button"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
}
