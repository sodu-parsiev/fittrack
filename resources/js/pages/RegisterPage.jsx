import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await register(form);
            navigate('/app/workout', { replace: true });
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell
            alternateHref="/login"
            alternateLabel="Log in"
            alternateText="Already have an account?"
            eyebrow="Session History"
            subtitle="Create a private account to keep your workouts, completed sets, and rest timing in one place."
            title="Start tracking sessions properly"
        >
            <form className="stack" onSubmit={handleSubmit}>
                {error ? <p className="status-banner status-banner--error">{error}</p> : null}

                <label className="field">
                    <span>Name</span>
                    <input
                        autoComplete="name"
                        required
                        type="text"
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                </label>

                <label className="field">
                    <span>Email</span>
                    <input
                        autoComplete="email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                </label>

                <div className="field-row">
                    <label className="field">
                        <span>Password</span>
                        <input
                            autoComplete="new-password"
                            required
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        />
                    </label>

                    <label className="field">
                        <span>Confirm password</span>
                        <input
                            autoComplete="new-password"
                            required
                            type="password"
                            value={form.password_confirmation}
                            onChange={(event) => setForm((current) => ({
                                ...current,
                                password_confirmation: event.target.value,
                            }))}
                        />
                    </label>
                </div>

                <button className="button" disabled={submitting} type="submit">
                    {submitting ? 'Creating account...' : 'Create account'}
                </button>
            </form>
        </AuthShell>
    );
}
