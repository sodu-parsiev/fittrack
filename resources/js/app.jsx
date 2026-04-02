import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WorkoutPage } from './pages/WorkoutPage';

function LoadingScreen() {
    const { t } = useTranslation();

    return (
        <div className="auth-screen">
            <div className="auth-shell">
                <section className="hero-panel">
                    <h1 className="hero-panel__title">{t('common.loading')}</h1>
                </section>
            </div>
        </div>
    );
}

function GuestOnlyRoute({ children }) {
    const { booting, user } = useAuth();

    if (booting) {
        return <LoadingScreen />;
    }

    if (user) {
        return <Navigate replace to="/app/workout" />;
    }

    return children;
}

function ProtectedRoute({ children }) {
    const { booting, user } = useAuth();

    if (booting) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate replace to="/login" />;
    }

    return <AppLayout>{children}</AppLayout>;
}

function WorkoutRoute() {
    const { booting } = useAuth();

    if (booting) {
        return <LoadingScreen />;
    }

    return (
        <AppLayout>
            <WorkoutPage />
        </AppLayout>
    );
}

function AppRouter() {
    return (
        <Routes>
            <Route
                path="/login"
                element={(
                    <GuestOnlyRoute>
                        <LoginPage />
                    </GuestOnlyRoute>
                )}
            />
            <Route
                path="/register"
                element={(
                    <GuestOnlyRoute>
                        <RegisterPage />
                    </GuestOnlyRoute>
                )}
            />
            <Route
                path="/app/workout"
                element={<WorkoutRoute />}
            />
            <Route
                path="/app/history"
                element={(
                    <ProtectedRoute>
                        <HistoryPage />
                    </ProtectedRoute>
                )}
            />
            <Route path="/" element={<Navigate replace to="/app/workout" />} />
            <Route path="*" element={<Navigate replace to="/app/workout" />} />
        </Routes>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <LanguageProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <AppRouter />
                    </AuthProvider>
                </BrowserRouter>
            </LanguageProvider>
        </React.StrictMode>,
    );
}
