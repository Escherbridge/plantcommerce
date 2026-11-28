import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createPrestackDatabase, dropDatabase } from '$lib/server/db/testing/prestackDatabase';

// A house-only checkout end to end on a pre-stack database, with and without the affiliate ledger tables, every
// switch unset: cart -> draft -> Checkout Session (Stripe faked) -> paid webhook -> order -> refund. Skipped
// without FLOW_TEST_DATABASE_URL.
const adminUrl = process.env.FLOW_TEST_DATABASE_URL;

const databaseModule = async () => {
	const url = process.env.PRESTACK_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 5, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
};
vi.mock('$env/dynamic/private', () => ({ env: {} }));

/** The Stripe edge: sessions are created and retrieved from memory. */
const sessions = new Map<string, Record<string, unknown>>();
vi.mock('./stripeCheckout', () => ({
	StripeCheckoutService: {
		createCheckoutSession: async (params: {
			draftReference: string;
			currency: string;
			expiresAt: Date;
			lineItems: { unitPriceMinor: number; quantity: number }[];
		}) => {
			const session = {
				id: 'cs_house_1',
				mode: 'payment',
				url: 'https://checkout.stripe.test/cs_house_1',
				currency: params.currency,
				expires_at: Math.floor(params.expiresAt.getTime() / 1000),
				amount_total: params.lineItems.reduce(
					(sum, item) => sum + item.unitPriceMinor * item.quantity,
					0
				),
				metadata: { checkout_draft_reference: params.draftReference },
				payment_status: 'unpaid'
			};
			sessions.set(session.id, session);
			return session;
		},
		getCheckoutSession: async (id: string) => sessions.get(id),
		expireCheckoutSession: async (id: string) => sessions.get(id)
	},
	buildCheckoutSessionCreateParams: () => ({})
}));

describe.skipIf(!adminUrl)(
	'house-only checkout on a pre-stack database',
	{ timeout: 90_000 },
	() => {
		describe.each([
			['without the affiliate ledger tables', false],
			['with the affiliate ledger tables', true]
		] as const)('%s', (_label, withLedger) => {
			const name = withLedger ? 'prestack_checkout_with' : 'prestack_checkout_without';
			let probe: postgres.Sql;

			beforeAll(async () => {
				const url = await createPrestackDatabase(adminUrl!, name, {
					withAffiliateLedgerTables: withLedger
				});
				process.env.PRESTACK_DATABASE_URL = url;
				probe = postgres(url, { max: 2, onnotice: () => {} });
				vi.resetModules();
				vi.doMock('$lib/server/db', databaseModule);
				const { ensureAdditiveMigrations } = await import('$lib/server/db/applyAdditiveMigrations');
				await ensureAdditiveMigrations();
				await probe`UPDATE product SET track_inventory = false, coming_soon = false WHERE id = 1`;
				const [cart] = await probe`INSERT INTO cart (session_id) VALUES ('guest-1') RETURNING id`;
				await probe`INSERT INTO cart_item (cart_id, product_id, quantity, unit_price) VALUES (${cart.id}, 1, 2, '25.00')`;
			});

			afterAll(async () => {
				await probe?.end({ timeout: 2 });
				delete process.env.PRESTACK_DATABASE_URL;
				await dropDatabase(adminUrl!, name);
			});

			it('creates the draft and session, fulfils the paid order, and processes a refund', async () => {
				const { CheckoutPaymentService } = await import('./checkoutPayment');
				const created = await CheckoutPaymentService.createOrReuseSession({
					kind: 'guest',
					guestCartSessionId: 'guest-1'
				});
				expect(created.stripeSessionId).toBe('cs_house_1');

				const [attempt] =
					await probe`SELECT amount_minor::int AS amount FROM checkout_payment_attempt`;
				sessions.set('cs_house_1', {
					...sessions.get('cs_house_1'),
					payment_status: 'paid',
					amount_total: attempt.amount,
					payment_intent: { id: 'pi_house_1', latest_charge: 'ch_house_new' },
					customer_details: {
						email: 'guest@example.com',
						name: 'Guest',
						address: {
							line1: '1 Main St',
							city: 'Austin',
							state: 'TX',
							postal_code: '78701',
							country: 'US'
						}
					}
				});

				const { StripeWebhookService } = await import('./stripeWebhook');
				const paid = {
					id: 'evt_paid',
					type: 'checkout.session.completed',
					data: { object: { id: 'cs_house_1' } }
				};
				expect(
					await StripeWebhookService.processVerifiedEvent(
						paid as never,
						Buffer.from(JSON.stringify(paid))
					)
				).toBe('processed');

				const [order] =
					await probe`SELECT stripe_charge_id, transfer_group FROM "order" WHERE stripe_session_id = 'cs_house_1'`;
				expect(order.stripe_charge_id).toBe('ch_house_new');
				expect(order.transfer_group).toBeTruthy();
				const [{ earnings }] = await probe`SELECT count(*)::int AS earnings FROM seller_earning`;
				expect(earnings).toBe(0);

				const refund = {
					id: 'evt_refund',
					type: 'charge.refunded',
					data: { object: { id: 'ch_house_new', amount_refunded: 1000 } }
				};
				expect(
					await StripeWebhookService.processVerifiedEvent(
						refund as never,
						Buffer.from(JSON.stringify(refund))
					)
				).toBe('processed');
			});
		});
	}
);
