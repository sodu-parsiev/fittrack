import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AppLayout({ children }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigationItems = user
        ? [
            { label: 'Workout', to: '/app/workout' },
            { label: 'History', to: '/app/history' },
        ]
        : [
            { label: 'Workout', to: '/app/workout' },
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
                        <h1 className="layout-header__title">Every set, already saved</h1>
                        <p className="layout-header__meta">
                            {user ? (
                                <>
                                    Signed in as <strong>{user.name}</strong>
                                </>
                            ) : (
                                'Guest mode saves workouts in the database for this device. Sign in to unlock history.'
                            )}
                        </p>
                    </div>

                    {user ? (
                        <button
                            className="button button--ghost"
                            onClick={handleLogout}
                            type="button"
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut ? 'Signing out...' : 'Log out'}
                        </button>
                    ) : (
                        <div className="layout-header__actions">
                            <Link className="button button--ghost" to="/login">
                                Log in
                            </Link>
                            <Link className="button button--auto" to="/register">
                                Create account
                            </Link>
                        </div>
                    )}
                </header>

                <nav className="nav-strip" aria-label="Primary navigation">
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
