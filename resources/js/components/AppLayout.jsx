import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';

function IconBase({ children }) {
    return (
        <svg aria-hidden="true" className="layout-header__auth-icon" fill="none" viewBox="0 0 24 24">
            {children}
        </svg>
    );
}

function LogInIcon() {
    return (
        <IconBase>
            <path
                d="M10 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3M13 8l4 4-4 4M9 12h8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.1"
            />
        </IconBase>
    );
}

function CreateAccountIcon() {
    return (
        <IconBase>
            <path
                d="M15 19a5 5 0 0 0-10 0M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 8v6M16 11h6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.1"
            />
        </IconBase>
    );
}

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
                <header className="layout-header layout-header--controls-only">
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
                                <Link
                                    aria-label={t('common.logIn')}
                                    className="button button--ghost button--icon-only layout-header__auth-link"
                                    title={t('common.logIn')}
                                    to="/login"
                                >
                                    <LogInIcon />
                                </Link>
                                <Link
                                    aria-label={t('common.createAccount')}
                                    className="button button--icon-only layout-header__auth-link"
                                    title={t('common.createAccount')}
                                    to="/register"
                                >
                                    <CreateAccountIcon />
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
