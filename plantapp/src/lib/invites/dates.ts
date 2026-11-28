const BOISE = 'America/Boise';

/** Calendar date in America/Boise, as YYYY-MM-DD. */
export function boiseCalendarDate(now: Date): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: BOISE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

/** End of the named America/Boise calendar day. */
export function endOfBoiseDay(isoDate: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
	const [year, month, day] = isoDate.split('-').map(Number);
	if (!year || !month || !day) return null;
	const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: BOISE,
		timeZoneName: 'shortOffset'
	}).formatToParts(probe);
	const zone = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT-7';
	const match = zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
	const minutes = match
		? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] ?? 0))
		: -7 * 60;
	const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - minutes * 60 * 1000);
	if (boiseCalendarDate(end) !== isoDate) return null;
	return end;
}

/** "16 Nov 2026 MST" */
export function formatBoiseDate(date: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: BOISE,
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZoneName: 'short'
	})
		.format(date)
		.replace(',', '');
}

/** "16 Nov 2026" without the zone, for compact row titles. */
export function formatBoiseDay(date: Date): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: BOISE,
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}
