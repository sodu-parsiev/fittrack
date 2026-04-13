export function formatDurationSecondsToMMSS(totalSeconds) {
    const seconds = Number.isFinite(Number(totalSeconds)) ? Math.max(0, Math.trunc(Number(totalSeconds))) : 0;
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

export function parseMMSSDuration(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const match = value.trim().match(/^(\d{1,3}):(\d{2})$/);
    if (!match) {
        return null;
    }

    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseInt(match[2], 10);

    if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || seconds > 59) {
        return null;
    }

    const totalSeconds = (minutes * 60) + seconds;

    return totalSeconds > 0 ? totalSeconds : null;
}
