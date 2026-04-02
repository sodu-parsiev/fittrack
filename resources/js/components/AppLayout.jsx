import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

export function AppLayout({ children }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { logout, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigationItems = user
        ? [
            { label: t('nav.workout'), to: '/app/workout' },
            { label: t('nav.history'), to: '/app/history' },
        ]
        : [
            { label: t('nav.workout'), to: '/app/workout' },
        ];

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            await logout();
            navigate('/login', { replace: true });
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div className="layout-shell">
            <div className="layout-shell__glow" />
            <div className="layout-shell__content">
                <header className="layout-header">
                    <div>
                        <p className="layout-header__eyebrow">FitTrack</p>
                    </div>

                    <div className="layout-header__controls">
                        <LanguageSwitcher />

                        {user ? (
                            <button
                                className="button button--ghost"
                                onClick={handleLogout}
                                type="button"
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? t('common.signingOut') : t('common.logOut')}
                            </button>
                        ) : (
                            <div className="layout-header__actions">
                                <Link className="button button--ghost" to="/login">
                                    {t('common.logIn')}
                                </Link>
                                <Link className="button button--auto" to="/register">
                                    {t('common.createAccount')}
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <nav className="nav-strip" aria-label={t('nav.primaryNavigation')}>
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.to}
                            className={({ isActive }) => (
                                isActive ? 'nav-strip__link nav-strip__link--active' : 'nav-strip__link'
                            )}
                            to={item.to}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <main className="page-shell">{children}</main>
            </div>
        </div>
    );
}
