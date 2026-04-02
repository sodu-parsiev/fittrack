const GUEST_TOKEN_STORAGE_KEY = 'fittrack_guest_workout_token';

function createGuestToken() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ensureGuestWorkoutToken() {
    const existingToken = window.localStorage.getItem(GUEST_TOKEN_STORAGE_KEY);

    if (existingToken) {
        return existingToken;
    }

    const nextToken = createGuestToken();
    window.localStorage.setItem(GUEST_TOKEN_STORAGE_KEY, nextToken);

    return nextToken;
}
