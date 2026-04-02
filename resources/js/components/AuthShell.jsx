import { Link } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AuthShell({
    alternateHref,
    alternateLabel,
    children,
    title,
}) {
    return (
        <div className="auth-screen">
            <div className="auth-shell">
                <section className="hero-panel">
                    <h1 className="hero-panel__title">{title}</h1>
                </section>

                <section className="auth-panel">
                    <div className="auth-panel__top">
                        <LanguageSwitcher />
                    </div>

                    {children}

                    <p className="auth-panel__footer">
                        <Link className="link-inline" to={alternateHref}>
                            {alternateLabel}
                        </Link>
                    </p>
                </section>
            </div>
        </div>
    );
}
