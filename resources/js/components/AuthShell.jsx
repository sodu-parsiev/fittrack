import { Link } from 'react-router-dom';

export function AuthShell({
    alternateHref,
    alternateLabel,
    alternateText,
    children,
    eyebrow,
    subtitle,
    title,
}) {
    return (
        <div className="auth-screen">
            <div className="auth-shell">
                <section className="hero-panel">
                    <p className="hero-panel__eyebrow">{eyebrow}</p>
                    <h1 className="hero-panel__title">{title}</h1>
                    <p className="hero-panel__copy">{subtitle}</p>

                    <div className="hero-panel__stats">
                        <div className="metric-pill">
                            <span className="metric-pill__label">Autosave</span>
                            <strong className="metric-pill__value">Every set</strong>
                        </div>
                        <div className="metric-pill">
                            <span className="metric-pill__label">History</span>
                            <strong className="metric-pill__value">Per user</strong>
                        </div>
                        <div className="metric-pill">
                            <span className="metric-pill__label">Focus</span>
                            <strong className="metric-pill__value">Zero clutter</strong>
                        </div>
                    </div>
                </section>

                <section className="auth-panel">
                    {children}

                    <p className="auth-panel__footer">
                        {alternateText}{' '}
                        <Link className="link-inline" to={alternateHref}>
                            {alternateLabel}
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
}
