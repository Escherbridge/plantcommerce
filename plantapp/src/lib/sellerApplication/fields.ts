export const sellerApplicationFields = [
	{ field: 'name', label: 'Name' },
	{ field: 'email', label: 'Email' },
	{ field: 'businessName', label: 'Business or farm name' },
	{ field: 'websiteOrSocial', label: 'Website or social' },
	{ field: 'offerings', label: 'What you grow or make' },
	{ field: 'location', label: 'Location' },
	{ field: 'message', label: 'Message' }
] as const;

export type SellerApplicationFieldName = (typeof sellerApplicationFields)[number]['field'];

export type SellerApplicationSummaryItem = {
	field: SellerApplicationFieldName;
	label: string;
	message: string;
};

/** Invalid fields in form order, each reusing that field's existing error text. */
export function sellerApplicationSummaryItems(
	fieldErrors: Record<string, string>
): SellerApplicationSummaryItem[] {
	return sellerApplicationFields
		.filter((item) => fieldErrors[item.field])
		.map((item) => ({
			field: item.field,
			label: item.label,
			message: fieldErrors[item.field]
		}));
}
