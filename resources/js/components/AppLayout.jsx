import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navigationItems = [
    { label: 'Workout', to: '/app/workout' },
    { label: 'History', to: '/app/history' },
];

export function AppLayout({ children }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
                            Signed in as <strong>{user?.name}</strong>
                        </p>
                    </div>

                    <button
                        className="button button--ghost"
                        onClick={handleLogout}
                        type="button"
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? 'Signing out...' : 'Log out'}
                    </button>
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
