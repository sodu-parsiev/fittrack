import { getLocale, translate } from './i18n';

export function formatWeightValue(value, locale = getLocale('en')) {
    const numeric = Number(value ?? 0);
    return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
    }).format(numeric);
}

export function formatWeightLabel(value, usesSelfWeight, language = 'en') {
    if (usesSelfWeight) {
        return translate(language, 'workout.selfWeight');
    }

    return `${formatWeightValue(value, getLocale(language))} ${translate(language, 'common.kg')}`;
}
