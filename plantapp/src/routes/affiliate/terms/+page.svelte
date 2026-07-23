<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
</script>

<svelte:head>
	<title>Affiliate Program Terms | Aevani</title>
	<meta
		name="description"
		content="The full terms of the Aevani affiliate program: tiered commission up to 5%, a flat 2% platform fee, a last-click 60-day cookie, clearing on fulfillment, and a $50 minimum monthly payout."
	/>
</svelte:head>

<Section>
	<Container>
		<div class="mx-auto max-w-4xl space-y-10">
			<header class="space-y-4">
				<p class="font-mono text-xs font-semibold tracking-widest text-secondary uppercase">
					Affiliate program
				</p>
				<h1 class="font-display text-4xl tracking-tight uppercase md:text-5xl">
					Affiliate program terms
				</h1>
				<p class="max-w-3xl text-lg text-base-content/70">
					These terms govern the Aevani affiliate program. By joining, you agree to them. They are
					summarized here; the complete legal agreement is the
					<code class="rounded bg-base-200 px-1.5 py-0.5 text-sm">AFFILIATE-AGREEMENT.md</code> published
					with the Aevani source, which controls in the event of any conflict.
				</p>
			</header>

			<section class="rounded-2xl border border-success/30 bg-success/10 p-6 md:p-8">
				<h2 class="font-display text-2xl tracking-tight uppercase">The deal at a glance</h2>
				<ul class="mt-3 list-disc space-y-2 pl-5 text-base-content/80">
					<li>Tiered commission of up to 5% on the attributed sale subtotal.</li>
					<li>A flat 2% platform fee is retained by Aevani on every sale.</li>
					<li>Last-click attribution with a 60-day cookie.</li>
					<li>Commission clears for payout when an order is fulfilled; reversed on refund.</li>
					<li>Self-serve onboarding, auto-approved when you accept these terms.</li>
					<li>$50 minimum payout, paid monthly from your cleared balance.</li>
				</ul>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">1. Commission &amp; tiers</h2>
				<p class="text-base-content/70">
					You earn a tiered commission on the attributed sale subtotal (the order subtotal before
					tax and shipping). Your tier is determined by your lifetime attributed sales and updates
					automatically as you grow:
				</p>
				<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Tier</th>
								<th>Commission rate</th>
								<th>Lifetime attributed sales</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="font-semibold">Sprout</td>
								<td>2%</td>
								<td>$0 – $5,000</td>
							</tr>
							<tr>
								<td class="font-semibold">Grower</td>
								<td>3.5%</td>
								<td>$5,000 – $25,000</td>
							</tr>
							<tr>
								<td class="font-semibold">Steward</td>
								<td>5%</td>
								<td>$25,000+</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p class="text-base-content/70">
					Aevani retains a flat 2% platform fee on every sale, independent of your commission tier.
				</p>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">2. Attribution</h2>
				<p class="text-base-content/70">
					Sales are credited on a last-click basis using a 60-day cookie. When a visitor clicks one
					of your affiliate links, they are attributed to you for 60 days from their most recent
					click. If they complete a purchase within that window, the sale is credited to your
					account. A later click on another affiliate's link before purchase reassigns the sale.
				</p>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">3. Clearing &amp; reversal</h2>
				<p class="text-base-content/70">
					Commission accrues when an attributed order is paid, and becomes payable once the order is
					fulfilled (shipped or delivered). If an order is refunded, charged back, or cancelled, the
					associated commission is reversed. Only cleared commission is eligible for payout.
				</p>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">4. Payouts</h2>
				<p class="text-base-content/70">
					Cleared commission is paid out monthly, provided your cleared balance is at least the $50
					minimum payout. Balances below the minimum roll over to the next month until the threshold
					is met.
				</p>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">5. Onboarding</h2>
				<p class="text-base-content/70">
					Onboarding is self-serve. Your affiliate account is auto-approved and active the moment you
					accept these terms — there is no manual review queue. You may begin creating and sharing
					tracked links immediately.
				</p>
			</section>

			<section class="space-y-4">
				<h2 class="font-display text-2xl tracking-tight uppercase">6. Prohibited conduct</h2>
				<p class="text-base-content/70">
					To keep the program fair, the following are prohibited and may result in reversed
					commission, withheld payouts, and termination of your participation:
				</p>
				<ul class="list-disc space-y-2 pl-5 text-base-content/70">
					<li>Self-referrals or purchases through your own links for your own benefit.</li>
					<li>Spam, unsolicited messaging, or misleading and deceptive claims about Aevani.</li>
					<li>Bidding on Aevani trademarks or impersonating Aevani in ads or search.</li>
					<li>Cookie stuffing, forced clicks, or any manipulation of attribution.</li>
					<li>Coupon, discount, or incentive fraud and undisclosed paid promotion.</li>
					<li>Any activity that violates applicable law or advertising-disclosure rules.</li>
				</ul>
			</section>

			<section class="grid gap-6 md:grid-cols-2">
				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">Ready to join?</h2>
						<p class="text-base-content/70">
							Accept these terms and your affiliate account activates instantly.
						</p>
						<a class="link link-primary" href="/affiliate/join">Join the affiliate program</a>
					</div>
				</div>

				<div class="card border border-base-200 bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="font-display card-title tracking-tight uppercase">Full agreement</h2>
						<p class="text-base-content/70">
							The complete, controlling terms are in
							<code class="rounded bg-base-200 px-1.5 py-0.5 text-sm">AFFILIATE-AGREEMENT.md</code>.
						</p>
						<a class="link link-primary" href="/terms">General Terms of Service</a>
					</div>
				</div>
			</section>
		</div>
	</Container>
</Section>
