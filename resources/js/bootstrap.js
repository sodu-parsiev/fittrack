import axios from 'axios';
import { ensureGuestWorkoutToken } from './lib/guestWorkout';

export const api = axios.create({
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

api.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers['X-Workout-Guest'] = ensureGuestWorkoutToken();

    return config;
});

export function setApiToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
}
