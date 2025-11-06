<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const returnSteps = [
		{
			step: 1,
			title: 'Initiate Return',
			description: 'Contact us or use your account dashboard to start a return'
		},
		{
			step: 2,
			title: 'Get Authorization',
			description: 'Receive a Return Authorization (RA) number via email'
		},
		{
			step: 3,
			title: 'Pack & Ship',
			description: 'Securely package the item and ship it back to us'
		},
		{
			step: 4,
			title: 'Receive Refund',
			description: 'Get your refund within 5-7 business days of receipt'
		}
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Returns & Refunds</h1>
			<p class="text-lg text-base-content/70">
				We want you to be completely satisfied. If you're not happy with your purchase, we're here
				to help.
			</p>
		</div>

		<!-- Return Policy Highlights -->
		<div class="alert alert-info mb-12">
			<div>
				<span class="font-semibold">30-Day Return Policy:</span> Return most items within 30 days
				of delivery for a full refund or exchange.
			</div>
		</div>

		<!-- Return Process -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6">How to Return an Item</h2>
			<Grid columns={4} gap={6}>
				{#each returnSteps as step}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body items-center text-center">
							<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mb-4">
								{step.step}
							</div>
							<h3 class="card-title text-lg">{step.title}</h3>
							<p class="text-sm text-base-content/70">{step.description}</p>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Start Return Form -->
		<div class="card bg-base-100 shadow-xl mb-12">
			<div class="card-body">
				<h2 class="card-title mb-4">Start a Return</h2>
				<p class="text-base-content/70 mb-6">
					Enter your order details below to begin the return process.
				</p>
				<div class="grid md:grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label" for="order-number">
							<span class="label-text">Order Number</span>
						</label>
						<input
							id="order-number"
							type="text"
							placeholder="ORD-12345"
							class="input input-bordered"
						/>
					</div>
					<div class="form-control">
						<label class="label" for="email">
							<span class="label-text">Email Address</span>
						</label>
						<input
							id="email"
							type="email"
							placeholder="your@email.com"
							class="input input-bordered"
						/>
					</div>
				</div>
				<button class="btn btn-primary mt-4">Submit Return Request</button>
			</div>
		</div>

		<!-- Return Conditions -->
		<div class="grid md:grid-cols-2 gap-6 mb-12">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title text-success">✓ Returnable Items</h3>
					<ul class="space-y-2 text-base-content/70">
						<li>→ Unopened products in original packaging</li>
						<li>→ Defective or damaged items (any condition)</li>
						<li>→ Wrong items sent by mistake</li>
						<li>→ Products within 30-day window</li>
						<li>→ Items with all original accessories</li>
					</ul>
				</div>
			</div>

			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title text-error">✗ Non-Returnable Items</h3>
					<ul class="space-y-2 text-base-content/70">
						<li>→ Live plants after 7 days</li>
						<li>→ Perishable nutrients/supplements (opened)</li>
						<li>→ Custom or special order items</li>
						<li>→ Items marked as "Final Sale"</li>
						<li>→ Products without original packaging</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Refund Information -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6">Refund Information</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>Return Reason</th>
							<th>Refund Amount</th>
							<th>Shipping Cost</th>
							<th>Processing Time</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="font-semibold">Defective/Damaged</td>
							<td>100% + Original Shipping</td>
							<td class="text-success">FREE Return Shipping</td>
							<td>3-5 business days</td>
						</tr>
						<tr>
							<td class="font-semibold">Wrong Item Sent</td>
							<td>100% + Original Shipping</td>
							<td class="text-success">FREE Return Shipping</td>
							<td>3-5 business days</td>
						</tr>
						<tr>
							<td class="font-semibold">Changed Mind</td>
							<td>100% (minus shipping)</td>
							<td class="text-warning">Customer Pays</td>
							<td>5-7 business days</td>
						</tr>
						<tr>
							<td class="font-semibold">Exchange</td>
							<td>N/A</td>
							<td class="text-success">FREE Both Ways</td>
							<td>3-5 business days</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Exchanges -->
		<div class="card bg-base-200 mb-12">
			<div class="card-body">
				<h2 class="card-title">Exchanges</h2>
				<p class="text-base-content/70 mb-4">
					Want to exchange an item for a different size, color, or product? We make it easy!
				</p>
				<div class="grid md:grid-cols-3 gap-6">
					<div>
						<h4 class="font-semibold mb-2">Same Product Exchange</h4>
						<p class="text-sm text-base-content/70">
							Different size or color of the same item - FREE shipping both ways
						</p>
					</div>
					<div>
						<h4 class="font-semibold mb-2">Different Product</h4>
						<p class="text-sm text-base-content/70">
							Exchange for a different product - you pay difference if applicable
						</p>
					</div>
					<div>
						<h4 class="font-semibold mb-2">Defective Items</h4>
						<p class="text-sm text-base-content/70">
							Immediate replacement shipped - keep or return defective item
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Warranty Information -->
		<div class="card bg-base-100 shadow-xl mb-12">
			<div class="card-body">
				<h2 class="card-title">Warranty Coverage</h2>
				<p class="text-base-content/70 mb-4">
					Many of our products come with manufacturer warranties. Here's what you need to know:
				</p>
				<Grid columns={3} gap={4}>
					<div>
						<h4 class="font-semibold mb-2">1 Year Warranty</h4>
						<p class="text-sm text-base-content/70">Most electronic equipment and grow lights</p>
					</div>
					<div>
						<h4 class="font-semibold mb-2">2 Year Warranty</h4>
						<p class="text-sm text-base-content/70">Premium systems and pumps</p>
					</div>
					<div>
						<h4 class="font-semibold mb-2">Lifetime Warranty</h4>
						<p class="text-sm text-base-content/70">Select professional-grade equipment</p>
					</div>
				</Grid>
				<div class="divider"></div>
				<a href="/warranty" class="link link-primary">View Full Warranty Terms →</a>
			</div>
		</div>

		<!-- Contact Support -->
		<div class="card bg-primary text-primary-content">
			<div class="card-body text-center">
				<h2 class="card-title justify-center">Questions About Returns?</h2>
				<p>Our customer service team is here to help make your return process smooth and easy.</p>
				<div class="card-actions justify-center mt-4">
					<a href="/contact" class="btn btn-secondary">Contact Support</a>
					<a href="/faq" class="btn btn-outline btn-secondary">View FAQ</a>
				</div>
			</div>
		</div>
	</Container>
</Section>
