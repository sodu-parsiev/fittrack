export function getErrorMessage(error, fallbackMessage) {
    const validationErrors = error?.response?.data?.errors;

    if (validationErrors && typeof validationErrors === 'object') {
        const [firstField] = Object.keys(validationErrors);
        const firstMessage = validationErrors[firstField]?.[0];

        if (firstMessage) {
            return firstMessage;
        }
    }

    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}
