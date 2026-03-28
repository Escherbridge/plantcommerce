<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const shippingOptions = [
		{
			name: 'Standard Shipping',
			duration: '5-7 Business Days',
			cost: '$9.99',
			description: 'Most economical option for non-urgent orders'
		},
		{
			name: 'Express Shipping',
			duration: '2-3 Business Days',
			cost: '$19.99',
			description: 'Faster delivery for time-sensitive items'
		},
		{
			name: 'Overnight Shipping',
			duration: '1 Business Day',
			cost: '$39.99',
			description: 'Next-day delivery for urgent needs'
		},
		{
			name: 'Free Shipping',
			duration: '7-10 Business Days',
			cost: 'FREE',
			description: 'On orders over $100'
		}
	];

	const internationalRegions = [
		{ region: 'Canada', duration: '7-14 days', cost: 'Starting at $24.99' },
		{ region: 'Mexico', duration: '10-14 days', cost: 'Starting at $29.99' },
		{ region: 'Europe', duration: '14-21 days', cost: 'Starting at $49.99' },
		{ region: 'Asia Pacific', duration: '14-28 days', cost: 'Starting at $59.99' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-4">Shipping Information</h1>
			<p class="text-lg text-base-content/70">
				Fast, reliable shipping to get your sustainable agriculture products delivered safely.
			</p>
		</div>

		<!-- Shipping Options -->
		<div class="mb-12">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-6">Domestic Shipping Options (US)</h2>
			<Grid columns={2} gap={6}>
				{#each shippingOptions as option}
					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
						<div class="card-body">
							<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Shipping</p>
							<h3 class="card-title font-display uppercase tracking-tight">{option.name}</h3>
							<div class="flex justify-between items-center my-4">
								<div>
									<p class="font-mono text-xs uppercase tracking-widest text-secondary">Delivery Time</p>
									<p class="font-semibold">{option.duration}</p>
								</div>
								<div class="text-right">
									<p class="font-mono text-xs uppercase tracking-widest text-secondary">Cost</p>
									<p class="text-2xl font-bold text-primary">{option.cost}</p>
								</div>
							</div>
							<p class="text-sm text-base-content/70">{option.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- International Shipping -->
		<div class="mb-12">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-6">International Shipping</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th class="font-mono text-xs uppercase tracking-widest">Region</th>
							<th class="font-mono text-xs uppercase tracking-widest">Delivery Time</th>
							<th class="font-mono text-xs uppercase tracking-widest">Shipping Cost</th>
						</tr>
					</thead>
					<tbody>
						{#each internationalRegions as region}
							<tr>
								<td class="font-semibold">{region.region}</td>
								<td>{region.duration}</td>
								<td class="text-primary font-semibold">{region.cost}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="alert alert-info mt-4">
				<span>
					International orders may be subject to customs duties and import taxes. These charges
					are the customer's responsibility.
				</span>
			</div>
		</div>

		<!-- Order Tracking -->
		<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md mb-12">
			<div class="card-body">
				<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Tracking</p>
				<h2 class="card-title font-display uppercase tracking-tight mb-4">Track Your Order</h2>
				<p class="text-base-content/70 mb-4">
					Enter your order number to track your shipment in real-time.
				</p>
				<div class="flex gap-4">
					<input
						type="text"
						placeholder="Order Number (e.g., ORD-12345)"
						class="input input-bordered flex-1"
					/>
					<button class="btn btn-primary font-display uppercase tracking-wider">Track Order</button>
				</div>
			</div>
		</div>

		<!-- Shipping Policies -->
		<div class="grid md:grid-cols-2 gap-6 mb-12">
			<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
				<div class="card-body">
					<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Policy</p>
					<h3 class="card-title font-display uppercase tracking-tight">Processing Time</h3>
					<ul class="space-y-2 text-base-content/70">
						<li>→ Orders placed before 2 PM EST ship same day</li>
						<li>→ Orders placed after 2 PM EST ship next business day</li>
						<li>→ Custom/special orders may require 3-5 business days</li>
						<li>→ Weekends and holidays may extend processing time</li>
					</ul>
				</div>
			</div>

			<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
				<div class="card-body">
					<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Policy</p>
					<h3 class="card-title font-display uppercase tracking-tight">Shipping Restrictions</h3>
					<ul class="space-y-2 text-base-content/70">
						<li>→ Live plants may have seasonal restrictions</li>
						<li>→ Some items cannot ship to PO boxes</li>
						<li>→ Hazardous materials require ground shipping only</li>
						<li>→ International shipments subject to local regulations</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Packaging & Handling -->
		<div class="card bg-base-200 rounded-3xl border border-base-200/30 shadow-md">
			<div class="card-body">
				<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Sustainability</p>
				<h2 class="card-title font-display uppercase tracking-tight">Eco-Friendly Packaging</h2>
				<p class="text-base-content/70 mb-4">
					We're committed to sustainability in every aspect of our business, including shipping:
				</p>
				<Grid columns={3} gap={4}>
					<div class="text-center">
						<div class="flex justify-center mb-2">
							<!-- Recycle icon -->
							<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
								<path d="M4 12l2-4h12l2 4M4 12l2 4h12l2-4M12 4v3M12 17v3M4 12h16"/>
							</svg>
						</div>
						<p class="font-display uppercase tracking-tight font-semibold">Recyclable Materials</p>
						<p class="text-sm text-base-content/60">100% recyclable packaging</p>
					</div>
					<div class="text-center">
						<div class="flex justify-center mb-2">
							<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
								<path d="M12 3c-4 4-8 9-8 14 0 3 2 5 5 5s5-2 5-5c0-5-4-10-8-14zM12 3v18"/>
							</svg>
						</div>
						<p class="font-display uppercase tracking-tight font-semibold">Biodegradable</p>
						<p class="text-sm text-base-content/60">Compostable packing peanuts</p>
					</div>
					<div class="text-center">
						<div class="flex justify-center mb-2">
							<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
								<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11"/>
							</svg>
						</div>
						<p class="font-display uppercase tracking-tight font-semibold">Minimal Packaging</p>
						<p class="text-sm text-base-content/60">Reduced waste approach</p>
					</div>
				</Grid>
			</div>
		</div>

		<!-- FAQs -->
		<div class="mt-12">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-6">Shipping FAQs</h2>
			<div class="space-y-4">
				<div class="collapse collapse-plus bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
					<input type="checkbox" />
					<div class="collapse-title font-semibold">
						Can I change my shipping address after placing an order?
					</div>
					<div class="collapse-content">
						<p class="text-base-content/70">
							Yes, if your order hasn't shipped yet. Contact our support team immediately at
							support@aevani.com with your order number and new address.
						</p>
					</div>
				</div>

				<div class="collapse collapse-plus bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
					<input type="checkbox" />
					<div class="collapse-title font-semibold">
						What if my package is damaged during shipping?
					</div>
					<div class="collapse-content">
						<p class="text-base-content/70">
							We pack all items carefully, but if damage occurs, please contact us within 48 hours
							with photos. We'll arrange a replacement or refund immediately.
						</p>
					</div>
				</div>

				<div class="collapse collapse-plus bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
					<input type="checkbox" />
					<div class="collapse-title font-semibold">Do you ship to APO/FPO addresses?</div>
					<div class="collapse-content">
						<p class="text-base-content/70">
							Yes! We ship to all APO/FPO addresses using USPS. Delivery typically takes 10-20
							business days.
						</p>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
