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
			<h1 class="text-4xl font-bold mb-4">Shipping Information</h1>
			<p class="text-lg text-base-content/70">
				Fast, reliable shipping to get your sustainable agriculture products delivered safely.
			</p>
		</div>

		<!-- Shipping Options -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6">Domestic Shipping Options (US)</h2>
			<Grid columns={2} gap={6}>
				{#each shippingOptions as option}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title">{option.name}</h3>
							<div class="flex justify-between items-center my-4">
								<div>
									<p class="text-sm text-base-content/70">Delivery Time</p>
									<p class="font-semibold">{option.duration}</p>
								</div>
								<div class="text-right">
									<p class="text-sm text-base-content/70">Cost</p>
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
			<h2 class="text-2xl font-bold mb-6">International Shipping</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>Region</th>
							<th>Delivery Time</th>
							<th>Shipping Cost</th>
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
		<div class="card bg-base-100 shadow-xl mb-12">
			<div class="card-body">
				<h2 class="card-title mb-4">Track Your Order</h2>
				<p class="text-base-content/70 mb-4">
					Enter your order number to track your shipment in real-time.
				</p>
				<div class="flex gap-4">
					<input
						type="text"
						placeholder="Order Number (e.g., ORD-12345)"
						class="input input-bordered flex-1"
					/>
					<button class="btn btn-primary">Track Order</button>
				</div>
			</div>
		</div>

		<!-- Shipping Policies -->
		<div class="grid md:grid-cols-2 gap-6 mb-12">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Processing Time</h3>
					<ul class="space-y-2 text-base-content/70">
						<li>→ Orders placed before 2 PM EST ship same day</li>
						<li>→ Orders placed after 2 PM EST ship next business day</li>
						<li>→ Custom/special orders may require 3-5 business days</li>
						<li>→ Weekends and holidays may extend processing time</li>
					</ul>
				</div>
			</div>

			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Shipping Restrictions</h3>
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
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Eco-Friendly Packaging</h2>
				<p class="text-base-content/70 mb-4">
					We're committed to sustainability in every aspect of our business, including shipping:
				</p>
				<Grid columns={3} gap={4}>
					<div class="text-center">
						<span class="text-4xl mb-2 block">♻️</span>
						<p class="font-semibold">Recyclable Materials</p>
						<p class="text-sm text-base-content/60">100% recyclable packaging</p>
					</div>
					<div class="text-center">
						<span class="text-4xl mb-2 block">🌿</span>
						<p class="font-semibold">Biodegradable</p>
						<p class="text-sm text-base-content/60">Compostable packing peanuts</p>
					</div>
					<div class="text-center">
						<span class="text-4xl mb-2 block">📦</span>
						<p class="font-semibold">Minimal Packaging</p>
						<p class="text-sm text-base-content/60">Reduced waste approach</p>
					</div>
				</Grid>
			</div>
		</div>

		<!-- FAQs -->
		<div class="mt-12">
			<h2 class="text-2xl font-bold mb-6">Shipping FAQs</h2>
			<div class="space-y-4">
				<div class="collapse collapse-plus bg-base-100">
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

				<div class="collapse collapse-plus bg-base-100">
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

				<div class="collapse collapse-plus bg-base-100">
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
