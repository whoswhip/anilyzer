import { colors } from '$lib/constants';

export const getColor = (value: number, maxValue: number, reverse = false) => {
    // if (!Number.isFinite(value) || value <= 0) return colors;

    // const normalized = value / maxValue;
    // const idx = Math.min(colors.length - 1, Math.ceil(normalized * (colors.length - 1)));

    // return colors[idx];
    // if reverse is true, invert the index, 0 -> last, last -> 0
    if (!Number.isFinite(value) || value <= 0) return colors[reverse ? colors.length - 1 : 0];

    const normalized = value / maxValue;
    let idx = Math.min(colors.length - 1, Math.ceil(normalized * (colors.length - 1)));
    if (reverse) {
        idx = colors.length - 1 - idx;
    }
    return colors[idx];
};