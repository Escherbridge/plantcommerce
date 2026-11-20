export type LeafMarkVariant = 'light' | 'dark';

export interface LeafMarkOptions {
	size?: number;
	variant?: LeafMarkVariant;
	className?: string;
	label?: string;
}

/** Path data for the header leaf. Tests compare the print template against these. */
export const LEAF_MARK_PATHS = {
	stem: 'M24 38 V21',
	primaryLeaf: 'M24.5 22.5 C24.5 14.5 30 10 37.5 9.5 C37.5 17.5 32 22.5 24.5 22.5 Z',
	secondaryLeaf: 'M23.5 28 C23.5 21.8 19.3 18.5 13.5 18 C13.5 24.2 17.7 28 23.5 28 Z'
} as const;

function attr(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

/**
 * The leaf mark from the site header.
 * Light: dark forest tile #1C3527, cream stem #F4F1EA, mint leaf #8FD8B4.
 * This is not the favicon monogram.
 */
export function leafMarkSvg(options: LeafMarkOptions = {}): string {
	const size = options.size ?? 36;
	const isDark = options.variant === 'dark';
	const rectFill = isDark ? '#8FD8B4' : '#1C3527';
	const stemStroke = isDark ? '#14261B' : '#F4F1EA';
	const leafPrimary = isDark ? '#14261B' : '#8FD8B4';
	const leafSecondary = isDark ? '#1E4A36' : '#F4F1EA';
	const classAttr = options.className ? ` class="${attr(options.className)}"` : '';
	const label = attr(options.label ?? 'Aevani');

	return `<svg${classAttr} width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="13" fill="${rectFill}"/><path d="M24 38 V21" stroke="${stemStroke}" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M24.5 22.5 C24.5 14.5 30 10 37.5 9.5 C37.5 17.5 32 22.5 24.5 22.5 Z" fill="${leafPrimary}"/><path d="M23.5 28 C23.5 21.8 19.3 18.5 13.5 18 C13.5 24.2 17.7 28 23.5 28 Z" fill="${leafSecondary}"/></svg>`;
}
