import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../bootstrap';
import { getErrorMessage } from '../lib/errors';
import { formatMuscleGroup } from '../lib/muscleGroups';

function formatDateTime(value) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatWeight(value) {
    const numeric = Number(value ?? 0);

    if (Number.isInteger(numeric)) {
        return numeric.toString();
    }

    return numeric.toFixed(2).replace(/\.?0+$/, '');
}

export function HistoryPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    async function loadSessions() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/api/sessions', {
                params: { status: 'completed' },
            });

            setSessions(response.data);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to load your session history.'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="stack stack--page">
            <section className="page-header">
                <div>
                    <p className="page-header__eyebrow">Session history</p>
                    <h2 className="page-header__title">Every completed workout, ordered newest first</h2>
                </div>
            </section>

            {error ? <p className="status-banner status-banner--error">{error}</p> : null}

            {loading ? (
                <section className="panel">
                    <div className="panel__header">
                        <h3 className="panel__title">Loading saved sessions</h3>
                        <p className="panel__subtitle">Pulling your workout history from the database.</p>
                    </div>
                </section>
            ) : null}

            {!loading && sessions.length === 0 ? (
                <section className="panel empty-state">
                    <div className="panel__header">
                        <h3 className="panel__title">No completed sessions yet</h3>
                        <p className="panel__subtitle">
                            Finish a workout and it will show up here with exercises, sets, and total volume.
                        </p>
                    </div>

                    <Link className="button" to="/app/workout">
                        Start your first workout
                    </Link>
                </section>
            ) : null}

            {!loading && sessions.length > 0 ? (
                <div className="history-list">
                    {sessions.map((session, index) => (
                        <details className="history-card" key={session.id} open={index === 0}>
                            <summary>
                                <div>
                                    <p className="history-card__eyebrow">{formatDateTime(session.startedAt)}</p>
                                    <h3>{session.title || 'Completed workout'}</h3>
                                </div>

                                <div className="badge-row">
                                    <span className="badge">{session.exerciseCount} exercises</span>
                                    <span className="badge">{session.totalSets} sets</span>
                                    <span className="badge">{formatWeight(session.totalVolume)} kg volume</span>
                                </div>
                            </summary>

                            <div className="history-card__content">
                                {session.exercises.map((exercise) => (
                                    <article className="history-exercise" key={exercise.id}>
                                        <div className="history-exercise__header">
                                            <h4>{exercise.name}</h4>
                                            <span>
                                                {exercise.categoryLabel ?? formatMuscleGroup(exercise.category)} · Target{' '}
                                                {exercise.targetReps} reps, last weight {formatWeight(exercise.currentWeight)} kg
                                            </span>
                                        </div>

                                        <ol className="set-list">
                                            {exercise.sets.map((set) => (
                                                <li key={set.id}>
                                                    Set {set.setNumber}: {set.reps} reps x {formatWeight(set.weight)} kg
                                                </li>
                                            ))}
                                        </ol>
                                    </article>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
