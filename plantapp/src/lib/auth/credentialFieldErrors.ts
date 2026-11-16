export type CredentialFieldError = {
	field: string;
	message: string;
};

export const CREDENTIAL_ERROR_SUMMARY_HEADING = 'Please review the following';

export function credentialErrorDomId(field: string, index: number): string {
	return `credential-error-${field}-${index}`;
}

export type CredentialSummaryItem = {
	id: string;
	field: string;
	message: string;
};

/**
 * One alert row per message, in first-seen order.
 * A sentence shared by two fields, such as the empty login credentials message,
 * is listed once. The first field keeps the summary link.
 */
export function credentialSummaryItems(errors: CredentialFieldError[]): CredentialSummaryItem[] {
	const items: CredentialSummaryItem[] = [];
	const seen = new Set<string>();
	errors.forEach((error, index) => {
		if (seen.has(error.message)) return;
		seen.add(error.message);
		items.push({
			id: credentialErrorDomId(error.field, index),
			field: error.field,
			message: error.message
		});
	});
	return items;
}

/** Ids of the summary items that describe one field. */
export function describedByFor(
	errors: CredentialFieldError[] | null | undefined,
	field: string
): string | undefined {
	if (!errors?.length) return undefined;
	const messages = new Set(
		errors.filter((item) => item.field === field).map((item) => item.message)
	);
	if (messages.size === 0) return undefined;
	const ids = credentialSummaryItems(errors)
		.filter((item) => messages.has(item.message))
		.map((item) => item.id);
	return ids.length > 0 ? ids.join(' ') : undefined;
}
