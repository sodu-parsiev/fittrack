import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../bootstrap';
import { SessionExerciseCard } from '../components/SessionExerciseCard';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/errors';
import { formatWeightValue } from '../lib/exerciseWeight';
import { MUSCLE_GROUP_OPTIONS } from '../lib/muscleGroups';

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
    const [notice, setNotice] = useState('');
    const [timeLeft, setTimeLeft] = useState(TIMER_START_SECONDS);
    const [timerRunning, setTimerRunning] = useState(false);

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
            if (user) {
                navigate('/app/history');
            } else {
                setNotice('Workout saved. Sign in if you want finished workouts to appear in history.');
            }
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to finish this workout.'));
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

    const timerCanReset = timerRunning || timeLeft !== TIMER_START_SECONDS;
    const timerDisplayLabel = formatTimerValue(timeLeft);

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
                        <FlagIcon />
                        <span>Finish workout</span>
                    </button>
                ) : null}
            </section>

            {activeSession ? (
                <section className="floating-timer" aria-label="Rest timer">
                    <div className="floating-timer__display" aria-live="polite">
                        {timerDisplayLabel}
                    </div>

                    <div className="floating-timer__actions" role="group" aria-label="Rest timer controls">
                        <button
                            className="button button--compact floating-timer__button"
                            disabled={timerRunning}
                            onClick={startTimer}
                            type="button"
                        >
                            Start
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
                        <PlayIcon />
                        <span>{saving ? 'Starting...' : 'Start workout'}</span>
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
                        <div className="workout-utility-bar__row">
                            <div className="workout-utility-bar__display" aria-live="polite">
                                {timerDisplayLabel}
                            </div>

                            <div className="workout-utility-bar__controls" role="group" aria-label="Workout utilities">
                                <button
                                    aria-label="Start timer"
                                    className="button button--compact button--icon-only workout-utility-bar__button"
                                    disabled={timerRunning}
                                    onClick={startTimer}
                                    title="Start timer"
                                    type="button"
                                >
                                    <PlayIcon />
                                </button>
                                <button
                                    aria-label="Reset timer"
                                    className="button button--danger-soft button--compact button--icon-only workout-utility-bar__button"
                                    disabled={!timerCanReset}
                                    onClick={resetTimer}
                                    title="Reset timer"
                                    type="button"
                                >
                                    <ResetIcon />
                                </button>
                                <button
                                    aria-label="Scroll to top"
                                    className="button button--ghost button--compact button--icon-only workout-utility-bar__button"
                                    onClick={scrollToTop}
                                    title="Top"
                                    type="button"
                                >
                                    <ArrowUpIcon />
                                </button>
                                <button
                                    aria-label="Scroll to bottom"
                                    className="button button--ghost button--compact button--icon-only workout-utility-bar__button"
                                    onClick={scrollToBottom}
                                    title="Bottom"
                                    type="button"
                                >
                                    <ArrowDownIcon />
                                </button>
                            </div>
                        </div>
                    </section>
                </>
            ) : null}
        </div>
    );
}
