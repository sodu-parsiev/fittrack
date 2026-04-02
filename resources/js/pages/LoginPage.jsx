import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useTranslation();
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
            alternateLabel={t('auth.createOne')}
            title={t('auth.loginTitle')}
        >
            <form className="stack" onSubmit={handleSubmit}>
                {error ? <p className="status-banner status-banner--error">{error}</p> : null}

                <label className="field">
                    <span>{t('common.email')}</span>
                    <input
                        autoComplete="email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                </label>

                <label className="field">
                    <span>{t('common.password')}</span>
                    <input
                        autoComplete="current-password"
                        required
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    />
                </label>

                <button className="button" disabled={submitting} type="submit">
                    {submitting ? t('auth.signingIn') : t('common.logIn')}
                </button>
            </form>
        </AuthShell>
    );
}
