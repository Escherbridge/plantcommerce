const ABSOLUTE_MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

/**
 * Deterministic absolute date (`Mon D, YYYY`) built from UTC parts.
 *
 * Unlike `formatRelativeTime` (which depends on `Date.now()`) and
 * `toLocaleDateString` (which depends on the host timezone/locale), this
 * produces byte-identical output on the SSR server and the hydrating client,
 * so it is safe to render during hydration without a `hydration_html_changed`
 * mismatch. See `src/lib/utils/AGENTS.md`.
 */
export function formatAbsoluteDate(date: Date | string): string {
	const then = typeof date === 'string' ? new Date(date) : date;
	if (Number.isNaN(then.getTime())) return '';
	return `${ABSOLUTE_MONTHS[then.getUTCMonth()]} ${then.getUTCDate()}, ${then.getUTCFullYear()}`;
}

export function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const then = typeof date === 'string' ? new Date(date) : date;
	const diffMs = now.getTime() - then.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHr = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHr / 24);
	const diffWeek = Math.floor(diffDay / 7);
	const diffMonth = Math.floor(diffDay / 30);

	if (diffSec < 60) return 'just now';
	if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
	if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
	if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
	if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
	return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
}
