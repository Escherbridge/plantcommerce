import { fail, redirect } from '@sveltejs/kit';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import type { Actions, PageServerLoad } from './$types';
import {
	SELLER_APPLICATION_DUPLICATE_WINDOW_MS,
	allowSellerApplication,
	sellerApplicationFieldErrors,
	sellerApplicationSchema
} from '$lib/server/sellerApplication/intake';
import { SellerApplicationService } from '$lib/server/sellerApplication/service';

const honeypotField = 'company_fax';
const appliedPath = '/sell?applied=1';

function rateSubject(ipAddress: string): string {
	return encodeHexLowerCase(
		sha256(new TextEncoder().encode(`seller-application:${ipAddress.trim().toLowerCase()}`))
	);
}

function formValue(data: FormData, key: string): string {
	const value = data.get(key);
	return typeof value === 'string' ? value : '';
}

export const load: PageServerLoad = async ({ url }) => {
	return { applied: url.searchParams.get('applied') === '1' };
};

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const values = {
			name: formValue(data, 'name'),
			email: formValue(data, 'email'),
			businessName: formValue(data, 'businessName'),
			websiteOrSocial: formValue(data, 'websiteOrSocial'),
			offerings: formValue(data, 'offerings'),
			location: formValue(data, 'location'),
			message: formValue(data, 'message')
		};

		let ipAddress = 'unknown';
		try {
			ipAddress = event.getClientAddress();
		} catch {
			ipAddress = 'unknown';
		}

		if (!allowSellerApplication(rateSubject(ipAddress))) {
			return fail(429, {
				error: 'Too many applications from this network. Please try again later.',
				values
			});
		}

		if (formValue(data, honeypotField).trim()) {
			throw redirect(303, appliedPath);
		}

		const parsed = sellerApplicationSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, {
				fieldErrors: sellerApplicationFieldErrors(parsed.error),
				values
			});
		}

		try {
			const since = new Date(Date.now() - SELLER_APPLICATION_DUPLICATE_WINDOW_MS);
			const duplicate = await SellerApplicationService.hasRecentDuplicate(
				parsed.data.email,
				parsed.data.businessName,
				since
			);
			if (!duplicate) {
				await SellerApplicationService.create(parsed.data);
			}
		} catch (error) {
			console.error('Unable to store seller application:', error);
			return fail(500, {
				error: 'We could not save your application. Please try again shortly.',
				values
			});
		}

		throw redirect(303, appliedPath);
	}
};
