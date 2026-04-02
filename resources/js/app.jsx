import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WorkoutPage } from './pages/WorkoutPage';

function LoadingScreen() {
    return (
        <div className="auth-screen">
            <div className="auth-shell">
                <section className="hero-panel">
                    <p className="hero-panel__eyebrow">FitTrack</p>
                    <h1 className="hero-panel__title">Loading your training log</h1>
                    <p className="hero-panel__copy">
                        Syncing your active session and restoring account access.
                    </p>
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
                element={(
                    <ProtectedRoute>
                        <WorkoutPage />
                    </ProtectedRoute>
                )}
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
            <BrowserRouter>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>,
    );
}
