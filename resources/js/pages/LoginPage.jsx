import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await login(form);
            navigate('/app/workout', { replace: true });
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell
            alternateHref="/register"
            alternateLabel="Create one"
            alternateText="Need an account?"
            eyebrow="Strength Log"
            subtitle="Pick up your current workout on any device, with every exercise and set stored under your account."
            title="Sign in to your training dashboard"
        >
            <form className="stack" onSubmit={handleSubmit}>
                {error ? <p className="status-banner status-banner--error">{error}</p> : null}

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

                <label className="field">
                    <span>Password</span>
                    <input
                        autoComplete="current-password"
                        required
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    />
                </label>

                <button className="button" disabled={submitting} type="submit">
                    {submitting ? 'Signing in...' : 'Log in'}
                </button>
            </form>
        </AuthShell>
    );
}
