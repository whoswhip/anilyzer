import { colors } from '$lib/constants';

export const getColor = (value: number, maxValue: number, reverse = false) => {
	if (!Number.isFinite(value) || value <= 0) return colors[reverse ? colors.length - 1 : 0];

	const normalized = value / maxValue;
	let idx = Math.min(colors.length - 1, Math.ceil(normalized * (colors.length - 1)));
	if (reverse) {
		idx = colors.length - 1 - idx;
	}
	return colors[idx];
};
export function darkenColor(hex: string, factor: number = 0.85): string {
	const v = hex.replace('#', '');
	const r = Math.floor(parseInt(v.slice(0, 2), 16) * factor);
	const g = Math.floor(parseInt(v.slice(2, 4), 16) * factor);
	const b = Math.floor(parseInt(v.slice(4, 6), 16) * factor);
	return (
		'#' +
		r.toString(16).padStart(2, '0') +
		g.toString(16).padStart(2, '0') +
		b.toString(16).padStart(2, '0')
	);
}
export function pluralize(count: number, singular: string, plural: string): string {
	return count === 1 ? singular : plural;
}
