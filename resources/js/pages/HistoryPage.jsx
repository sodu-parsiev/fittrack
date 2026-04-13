import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../bootstrap';
import { useTranslation } from '../contexts/LanguageContext';
import { formatDurationSecondsToMMSS } from '../lib/duration';
import { getErrorMessage } from '../lib/errors';
import { formatWeightLabel, formatWeightValue } from '../lib/exerciseWeight';
import { formatMuscleGroup } from '../lib/muscleGroups';

function formatDateTime(value, locale) {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function HistoryPage() {
    const { language, locale, t } = useTranslation();
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
            setError(getErrorMessage(requestError, t('history.unableToLoad')));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="stack stack--page">
            {error ? <p className="status-banner status-banner--error">{error}</p> : null}

            {loading ? (
                <section className="panel">
                    <div className="panel__header">
                        <h3 className="panel__title">{t('common.loading')}</h3>
                    </div>
                </section>
            ) : null}

            {!loading && sessions.length === 0 ? (
                <section className="panel empty-state">
                    <Link className="button" to="/app/workout">
                        {t('history.startWorkout')}
                    </Link>
                </section>
            ) : null}

            {!loading && sessions.length > 0 ? (
                <div className="history-list">
                    {sessions.map((session, index) => (
                        <details className="history-card" key={session.id} open={index === 0}>
                            <summary>
                                <div>
                                    <p className="history-card__eyebrow">{formatDateTime(session.startedAt, locale)}</p>
                                    <h3>{session.title || t('history.completedWorkout')}</h3>
                                </div>

                                <div className="badge-row">
                                    <span className="badge">{t('history.exercisesBadge', { count: session.exerciseCount })}</span>
                                    <span className="badge">{t('history.setsBadge', { count: session.totalSets })}</span>
                                    <span className="badge">
                                        {t('history.volumeBadge', {
                                            unit: t('common.kg'),
                                            value: formatWeightValue(session.totalVolume, locale),
                                        })}
                                    </span>
                                </div>
                            </summary>

                            <div className="history-card__content">
                                {session.exercises.map((exercise) => {
                                    const isCardio = exercise.category === 'cardio';

                                    return (
                                    <article className="history-exercise" key={exercise.id}>
                                        <div className="history-exercise__header">
                                            <h4>{exercise.name}</h4>
                                            <span>
                                                {isCardio
                                                    ? t('history.cardioExerciseSummary', {
                                                        category: formatMuscleGroup(exercise.category, language),
                                                        targetTime: formatDurationSecondsToMMSS(exercise.targetDurationSeconds ?? 0),
                                                    })
                                                    : t('history.exerciseSummary', {
                                                        category: formatMuscleGroup(exercise.category, language),
                                                        targetReps: exercise.targetReps,
                                                        weight: formatWeightLabel(
                                                            exercise.currentWeight,
                                                            exercise.usesSelfWeight,
                                                            language,
                                                        ),
                                                    })}
                                            </span>
                                        </div>

                                        <ol className="set-list">
                                            {exercise.sets.map((set) => (
                                                <li key={set.id}>
                                                    {exercise.category === 'cardio'
                                                        ? t('history.cardioSetEntry', {
                                                            number: set.setNumber,
                                                            duration: formatDurationSecondsToMMSS(set.durationSeconds ?? 0),
                                                        })
                                                        : t('history.setEntry', {
                                                            number: set.setNumber,
                                                            reps: set.reps,
                                                            weight: formatWeightLabel(set.weight, set.usesSelfWeight, language),
                                                        })}
                                                </li>
                                            ))}
                                        </ol>
                                    </article>
                                    );
                                })}
                            </div>
                        </details>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
