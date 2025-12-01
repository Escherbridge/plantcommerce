import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from './email';

describe('EmailService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    describe('sendVerificationEmail', () => {
        it('should log verification link to console', async () => {
            const email = 'test@example.com';
            const token = 'test-token-123';

            await EmailService.sendVerificationEmail(email, token);

            expect(console.log).toHaveBeenCalledWith(expect.stringContaining(email));
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining(token));
        });
    });
});
