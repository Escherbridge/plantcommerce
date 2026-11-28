import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { accountCreationFailureCopy } from './accountCreation';

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function source(path: string): string {
	return readFileSync(join(srcDir, path), 'utf8');
}

describe('account creation failure copy', () => {
	it('uses one sentence for the API and the register page', () => {
		expect(accountCreationFailureCopy).toBe(
			"We couldn't finish creating that account. Try signing in, or contact us."
		);

		const register = source('routes/register/+page.svelte');
		const auth = source('lib/server/api/auth.ts');

		expect(register.match(/errorMessage = accountCreationFailureCopy/g)).toHaveLength(2);
		expect(register).toContain('class="link link-primary"');
		expect(register).toContain('href="/contact"');
		expect(register).toContain('{accountCreationContactPhrase}');
		expect(register).not.toContain('Please try signing in or contact support');
		expect(register).not.toContain('Please review them and try again');
		expect(register).not.toContain('We could not complete account creation');

		expect(auth).toContain('message: accountCreationFailureCopy');
		expect(auth).not.toContain('We could not create an account with those details.');
	});
});
