export const SELL_TRANSPORT_ERROR = "That didn't send. Check your connection and try again.";

export type SellDraft = {
	name: string;
	email: string;
	businessName: string;
	websiteOrSocial: string;
	offerings: string;
	location: string;
	message: string;
};

function fieldText(formData: FormData, key: keyof SellDraft): string {
	const value = formData.get(key);
	return typeof value === 'string' ? value : '';
}

/** Values currently in the form, including text the visitor typed before the request failed. */
export function sellDraftFromFormData(formData: FormData): SellDraft {
	return {
		name: fieldText(formData, 'name'),
		email: fieldText(formData, 'email'),
		businessName: fieldText(formData, 'businessName'),
		websiteOrSocial: fieldText(formData, 'websiteOrSocial'),
		offerings: fieldText(formData, 'offerings'),
		location: fieldText(formData, 'location'),
		message: fieldText(formData, 'message')
	};
}

/**
 * Network drops and server error results must stay on the form.
 * `update()` would render the generic error page and discard what was typed.
 */
export async function applySellEnhanceResult(
	result: { type: string },
	update: () => Promise<void>
): Promise<'kept' | 'applied'> {
	if (result.type === 'error') return 'kept';
	await update();
	return 'applied';
}
