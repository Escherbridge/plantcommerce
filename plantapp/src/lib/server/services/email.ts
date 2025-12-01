export class EmailService {
    /**
     * Send verification email to user
     */
    static async sendVerificationEmail(email: string, token: string): Promise<void> {
        // In a real application, this would use a provider like SendGrid, AWS SES, etc.
        // For now, we'll log the verification link to the console.

        const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

        console.log('----------------------------------------------------------------');
        console.log(`📧 Sending verification email to: ${email}`);
        console.log(`🔗 Link: ${verificationLink}`);
        console.log('----------------------------------------------------------------');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

export default EmailService;
