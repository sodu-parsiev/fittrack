import axios from 'axios';

export const api = axios.create({
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export function setApiToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
    }

    delete api.defaults.headers.common.Authorization;
}
