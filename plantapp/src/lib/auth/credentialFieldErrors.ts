export type CredentialFieldError = {
	field: string;
	message: string;
};

export const CREDENTIAL_ERROR_SUMMARY_HEADING = 'Please review the following';

export function credentialErrorDomId(field: string, index: number): string {
	return `credential-error-${field}-${index}`;
}

/** Ids of the summary items that describe one field. */
export function describedByFor(
	errors: CredentialFieldError[] | null | undefined,
	field: string
): string | undefined {
	if (!errors?.length) return undefined;
	const ids = errors.flatMap((item, index) =>
		item.field === field ? [credentialErrorDomId(field, index)] : []
	);
	return ids.length > 0 ? ids.join(' ') : undefined;
}
