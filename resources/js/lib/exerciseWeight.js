export function formatWeightValue(value) {
    const numeric = Number(value ?? 0);

    if (Number.isInteger(numeric)) {
        return numeric.toString();
    }

    return numeric.toFixed(2).replace(/\.?0+$/, '');
}

export function formatWeightLabel(value, usesSelfWeight) {
    return usesSelfWeight ? 'Self weight' : `${formatWeightValue(value)} kg`;
}
