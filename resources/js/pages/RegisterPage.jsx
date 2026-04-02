import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { t } = useTranslation();
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
            alternateLabel={t('common.logIn')}
            title={t('auth.registerTitle')}
        >
            <form className="stack" onSubmit={handleSubmit}>
                {error ? <p className="status-banner status-banner--error">{error}</p> : null}

                <label className="field">
                    <span>{t('common.name')}</span>
                    <input
                        autoComplete="name"
                        required
                        type="text"
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                </label>

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

                <div className="field-row">
                    <label className="field">
                        <span>{t('common.password')}</span>
                        <input
                            autoComplete="new-password"
                            required
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                        />
                    </label>

                    <label className="field">
                        <span>{t('common.confirmPassword')}</span>
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
                    {submitting ? t('auth.creatingAccount') : t('common.createAccount')}
                </button>
            </form>
        </AuthShell>
    );
}
