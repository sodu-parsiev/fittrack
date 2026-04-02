import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../bootstrap';
import { SessionExerciseCard } from '../components/SessionExerciseCard';
import { getErrorMessage } from '../lib/errors';
import { formatWeightValue } from '../lib/exerciseWeight';
import { MUSCLE_GROUP_OPTIONS } from '../lib/muscleGroups';

const REST_SECONDS_STORAGE_KEY = 'fittrack_rest_seconds';
const TIMER_SOUND = 'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

function readInitialRestSeconds() {
    const storedValue = Number.parseInt(window.localStorage.getItem(REST_SECONDS_STORAGE_KEY) ?? '60', 10);

    if (Number.isNaN(storedValue) || storedValue < 1) {
        return 60;
    }

    return storedValue;
}

function roundWeight(value) {
    return Math.max(0, Math.round(value * 100) / 100);
}

function playTimerSound() {
    try {
        const audio = new Audio(TIMER_SOUND);
        audio.play();
    } catch {
        // Ignore audio failures in browsers that block autoplay.
    }
}

function formatDateTime(value) {
    if (!value) {
        return 'Just now';
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatTimerValue(value) {
    const totalSeconds = Math.max(0, Number(value) || 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
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
    const [notice, setNotice] = useState('');
    const [restSeconds, setRestSeconds] = useState(readInitialRestSeconds);
    const [timeLeft, setTimeLeft] = useState(readInitialRestSeconds);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerFinished, setTimerFinished] = useState(false);

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
        window.localStorage.setItem(REST_SECONDS_STORAGE_KEY, String(restSeconds));

        if (!timerRunning && !timerFinished) {
            setTimeLeft(restSeconds);
        }
    }, [restSeconds]);

    useEffect(() => {
        if (!timerRunning) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setTimeLeft((current) => {
                if (current <= 1) {
                    window.clearInterval(interval);
                    setTimerRunning(false);
                    setTimerFinished(true);
                    playTimerSound();
                    return 0;
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
            setError(getErrorMessage(requestError, 'Unable to load your current workout.'));
        } finally {
            setLoading(false);
        }
    }

    async function startWorkout() {
        setSaving(true);
        setError('');
        setNotice('');

        try {
            const response = await api.post('/api/sessions');
            setActiveSession(response.data);
            setNotice('Workout started. Every change is saved immediately.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to start a workout.'));
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
        setNotice('');

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
            setNotice('Exercise added to your active session.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to add that exercise.'));
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

    async function updateExerciseWeight(exercise, delta) {
        if (exercise.usesSelfWeight) {
            return;
        }

        setSaving(true);
        setError('');
        setNotice('');

        try {
            const response = await api.patch(`/api/exercises/${exercise.id}`, {
                current_weight: roundWeight(Number(exercise.currentWeight) + delta),
            });

            const updatedSession = response.data;
            const updatedExercise = updatedSession.exercises.find((item) => item.id === exercise.id);

            setActiveSession(updatedSession);
            setDraftSets((current) => ({
                ...current,
                [exercise.id]: {
                    ...current[exercise.id],
                    weight: String(updatedExercise?.currentWeight ?? roundWeight(Number(exercise.currentWeight) + delta)),
                },
            }));
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to update the weight.'));
        } finally {
            setSaving(false);
        }
    }

    async function updateExerciseWeightType(exercise, usesSelfWeight) {
        if (exercise.usesSelfWeight === usesSelfWeight) {
            return;
        }

        const draft = draftSets[exercise.id];

        setSaving(true);
        setError('');
        setNotice('');

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
            setError(getErrorMessage(requestError, 'Unable to update the weight type.'));
        } finally {
            setSaving(false);
        }
    }

    async function completeSet(exercise) {
        const draft = draftSets[exercise.id] ?? buildDraftSet(exercise);

        setSaving(true);
        setError('');
        setNotice('');

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
            setNotice('Set saved.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to save that set.'));
        } finally {
            setSaving(false);
        }
    }

    async function removeExercise(exercise) {
        if (!window.confirm(`Delete ${exercise.name} from this session?`)) {
            return;
        }

        setSaving(true);
        setError('');
        setNotice('');

        try {
            const response = await api.delete(`/api/exercises/${exercise.id}`);
            setActiveSession(response.data);
            setNotice('Exercise removed from the current workout.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to remove that exercise.'));
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
        setNotice('');

        try {
            await api.patch(`/api/sessions/${activeSession.id}`, {
                status: 'completed',
            });

            setActiveSession(null);
            navigate('/app/history');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to finish this workout.'));
        } finally {
            setSaving(false);
        }
    }

    function startTimer() {
        const shouldResume = !timerFinished && timeLeft > 0 && timeLeft < restSeconds;

        setTimerFinished(false);
        // Resume from a paused countdown; otherwise start fresh from the configured duration.
        setTimeLeft(shouldResume ? timeLeft : restSeconds);
        setTimerRunning(true);
    }

    function pauseTimer() {
        setTimerRunning(false);
        setTimerFinished(false);
    }

    function resetTimer() {
        setTimerRunning(false);
        setTimerFinished(false);
        setTimeLeft(restSeconds);
    }

    function handleRestSecondsChange(event) {
        const nextValue = Number.parseInt(event.target.value || '0', 10);

        setRestSeconds(Number.isNaN(nextValue) ? 60 : Math.max(1, nextValue));
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

    if (loading) {
        return (
            <section className="panel">
                <div className="panel__header">
                    <h2 className="panel__title">Loading your active session</h2>
                    <p className="panel__subtitle">Checking whether you already have a workout in progress.</p>
                </div>
            </section>
        );
    }

    const timerCanResume = !timerRunning && !timerFinished && timeLeft > 0 && timeLeft < restSeconds;
    const timerCanReset = timerRunning || timerFinished || timeLeft !== restSeconds;
    const timerStartLabel = timerCanResume ? 'Resume' : 'Start';
    const timerStatusLabel = timerRunning ? 'Running' : timerFinished ? 'Completed' : timerCanResume ? 'Paused' : 'Ready';
    const timerDisplayLabel = timerFinished ? 'Done' : formatTimerValue(timeLeft);

    return (
        <div className={`stack stack--page ${activeSession ? 'stack--page-with-utility' : ''}`.trim()}>
            <section className="page-header">
                <div>
                    <p className="page-header__eyebrow">Active workout</p>
                    <h2 className="page-header__title">Track the session you are lifting right now</h2>
                </div>

                {activeSession ? (
                    <button
                        className="button button--secondary button--auto"
                        disabled={saving}
                        onClick={finishWorkout}
                        type="button"
                    >
                        Finish workout
                    </button>
                ) : null}
            </section>

            {activeSession ? (
                <section className="floating-timer" aria-label="Rest timer">
                    <div className="floating-timer__top">
                        <div className="floating-timer__meta">
                            <span className="floating-timer__label">Rest timer</span>
                            <span className="floating-timer__status">{timerStatusLabel}</span>
                        </div>

                        <div className="floating-timer__display" aria-live="polite">
                            {timerDisplayLabel}
                        </div>
                    </div>

                    <label className="field floating-timer__field">
                        <span>Seconds</span>
                        <input
                            inputMode="numeric"
                            min="1"
                            type="number"
                            value={restSeconds}
                            onChange={handleRestSecondsChange}
                        />
                    </label>

                    <div className="floating-timer__actions" role="group" aria-label="Rest timer controls">
                        <button
                            className="button button--compact floating-timer__button"
                            disabled={timerRunning || restSeconds < 1}
                            onClick={startTimer}
                            type="button"
                        >
                            {timerStartLabel}
                        </button>
                        <button
                            className="button button--secondary button--compact floating-timer__button"
                            disabled={!timerRunning}
                            onClick={pauseTimer}
                            type="button"
                        >
                            Pause
                        </button>
                        <button
                            className="button button--danger-soft button--compact floating-timer__button"
                            disabled={!timerCanReset}
                            onClick={resetTimer}
                            type="button"
                        >
                            Reset
                        </button>
                    </div>
                </section>
            ) : null}

            {error ? <p className="status-banner status-banner--error">{error}</p> : null}
            {notice ? <p className="status-banner status-banner--success">{notice}</p> : null}

            {!activeSession ? (
                <section className="panel empty-state">
                    <div className="panel__header">
                        <h3 className="panel__title">No workout in progress</h3>
                        <p className="panel__subtitle">
                            Start a session when you walk into the gym. Each exercise and completed set will save to
                            your account automatically.
                        </p>
                    </div>

                    <button className="button" disabled={saving} onClick={startWorkout} type="button">
                        {saving ? 'Starting...' : 'Start workout'}
                    </button>
                </section>
            ) : (
                <>
                    <section className="panel">
                        <div className="panel__header">
                            <h3 className="panel__title">Current exercises</h3>
                            <p className="panel__subtitle">
                                Use the quick weight buttons or log completed sets directly into the active session.
                            </p>
                        </div>

                        {activeSession.exercises.length > 0 ? (
                            <div className="exercise-list">
                                {activeSession.exercises.map((exercise) => (
                                    <SessionExerciseCard
                                        key={exercise.id}
                                        draft={draftSets[exercise.id]}
                                        exercise={exercise}
                                        onChangeDraft={handleDraftChange}
                                        onCompleteSet={completeSet}
                                        onDecreaseWeight={(selectedExercise) => updateExerciseWeight(selectedExercise, -2.5)}
                                        onIncreaseWeight={(selectedExercise) => updateExerciseWeight(selectedExercise, 2.5)}
                                        onRemoveExercise={removeExercise}
                                        onToggleSelfWeight={updateExerciseWeightType}
                                        saving={saving}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="empty-inline">No exercises yet.</p>
                        )}
                    </section>

                    <section className="metric-grid" aria-label="Workout summary">
                        <article className="metric-pill">
                            <span className="metric-pill__label">Started</span>
                            <strong className="metric-pill__value">{formatDateTime(activeSession.startedAt)}</strong>
                        </article>
                        <article className="metric-pill">
                            <span className="metric-pill__label">Exercises</span>
                            <strong className="metric-pill__value">{activeSession.exerciseCount}</strong>
                        </article>
                        <article className="metric-pill">
                            <span className="metric-pill__label">Sets</span>
                            <strong className="metric-pill__value">{activeSession.totalSets}</strong>
                        </article>
                        <article className="metric-pill">
                            <span className="metric-pill__label">Volume</span>
                            <strong className="metric-pill__value">{formatWeightValue(activeSession.totalVolume)} kg</strong>
                        </article>
                    </section>

                    <section className="panel">
                        <div className="panel__header">
                            <h3 className="panel__title">Add exercise</h3>
                            <p className="panel__subtitle">Based on your original template, but now persisted per user.</p>
                        </div>

                        <form className="stack" onSubmit={handleAddExercise}>
                            <label className="field">
                                <span>Exercise name</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="Smith bench"
                                    value={exerciseForm.name}
                                    onChange={(event) => setExerciseForm((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))}
                                />
                            </label>

                            <label className="field">
                                <span>Muscle group</span>
                                <select
                                    required
                                    value={exerciseForm.category}
                                    onChange={(event) => setExerciseForm((current) => ({
                                        ...current,
                                        category: event.target.value,
                                    }))}
                                >
                                    <option disabled value="">Choose a muscle group</option>
                                    {MUSCLE_GROUP_OPTIONS.map((group) => (
                                        <option key={group.value} value={group.value}>
                                            {group.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="field">
                                <span>Weight type</span>
                                <div className="choice-row" role="group" aria-label="Exercise weight type">
                                    <button
                                        className={`choice-chip ${!exerciseForm.usesSelfWeight ? 'choice-chip--active' : ''}`}
                                        onClick={() => setExerciseForm((current) => ({
                                            ...current,
                                            usesSelfWeight: false,
                                        }))}
                                        type="button"
                                    >
                                        External weight
                                    </button>
                                    <button
                                        className={`choice-chip ${exerciseForm.usesSelfWeight ? 'choice-chip--active' : ''}`}
                                        onClick={() => setExerciseForm((current) => ({
                                            ...current,
                                            usesSelfWeight: true,
                                        }))}
                                        type="button"
                                    >
                                        Self weight
                                    </button>
                                </div>
                            </div>

                            <div className="field-row workout-form__pair">
                                <label className="field">
                                    <span>Weight (kg)</span>
                                    <input
                                        disabled={exerciseForm.usesSelfWeight}
                                        min="0"
                                        step="0.5"
                                        type="number"
                                        value={exerciseForm.currentWeight}
                                        onChange={(event) => setExerciseForm((current) => ({
                                            ...current,
                                            currentWeight: event.target.value,
                                        }))}
                                    />
                                    {exerciseForm.usesSelfWeight ? (
                                        <small className="field__hint">Bodyweight exercise. Logged sets will show Self weight.</small>
                                    ) : null}
                                </label>

                                <label className="field">
                                    <span>Target reps</span>
                                    <input
                                        min="1"
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
                                {saving ? 'Saving...' : 'Add exercise'}
                            </button>
                        </form>
                    </section>
                </>
            )}

            {activeSession ? (
                <>
                    <div className="scroll-dock" aria-label="Scroll controls">
                        <button className="scroll-dock__button" onClick={scrollToTop} type="button">
                            Top
                        </button>
                        <button className="scroll-dock__button" onClick={scrollToBottom} type="button">
                            Bottom
                        </button>
                    </div>

                    <section className="workout-utility-bar" aria-label="Workout utilities">
                        <div className="workout-utility-bar__top">
                            <div className="workout-utility-bar__meta">
                                <span className="floating-timer__label">Rest timer</span>
                                <span className="floating-timer__status">{timerStatusLabel}</span>
                            </div>

                            <div className="workout-utility-bar__display" aria-live="polite">
                                {timerDisplayLabel}
                            </div>

                            <div className="workout-utility-bar__scroll" role="group" aria-label="Scroll controls">
                                <button
                                    className="button button--ghost button--compact workout-utility-bar__scroll-button"
                                    onClick={scrollToTop}
                                    type="button"
                                >
                                    Top
                                </button>
                                <button
                                    className="button button--ghost button--compact workout-utility-bar__scroll-button"
                                    onClick={scrollToBottom}
                                    type="button"
                                >
                                    Bottom
                                </button>
                            </div>
                        </div>

                        <div className="workout-utility-bar__bottom">
                            <label className="field workout-utility-bar__field">
                                <span>Seconds</span>
                                <input
                                    inputMode="numeric"
                                    min="1"
                                    type="number"
                                    value={restSeconds}
                                    onChange={handleRestSecondsChange}
                                />
                            </label>

                            <div className="workout-utility-bar__actions" role="group" aria-label="Rest timer controls">
                                <button
                                    className="button button--compact"
                                    disabled={timerRunning || restSeconds < 1}
                                    onClick={startTimer}
                                    type="button"
                                >
                                    {timerStartLabel}
                                </button>
                                <button
                                    className="button button--secondary button--compact"
                                    disabled={!timerRunning}
                                    onClick={pauseTimer}
                                    type="button"
                                >
                                    Pause
                                </button>
                                <button
                                    className="button button--danger-soft button--compact"
                                    disabled={!timerCanReset}
                                    onClick={resetTimer}
                                    type="button"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
}
