import type { RequestHandler } from './$types';
import { consoleCsv, loadPayoutConsole } from '$lib/server/services/payoutConsole';

export const GET: RequestHandler = async () => {
	const data = await loadPayoutConsole();
	return new Response(consoleCsv(data), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="payouts.csv"'
		}
	});
};
