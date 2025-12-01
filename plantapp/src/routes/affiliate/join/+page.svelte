<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const benefits = [
		{
			title: 'Competitive Commissions',
			description: 'Earn up to 15% commission on all referred sales with our tiered system',
			icon: '💰'
		},
		{
			title: 'Marketing Materials',
			description: 'Access professional banners, images, and content to promote our products',
			icon: '📊'
		},
		{
			title: 'Real-time Analytics',
			description: 'Track clicks, conversions, and earnings with our comprehensive dashboard',
			icon: '📈'
		},
		{
			title: 'Dedicated Support',
			description: 'Get help from our affiliate team to maximize your earning potential',
			icon: '🤝'
		},
		{
			title: 'Cookie Duration',
			description: '30-day cookie window ensures you get credit for all referred customers',
			icon: '🍪'
		},
		{
			title: 'Monthly Payouts',
			description: 'Receive timely payments via PayPal, bank transfer, or check',
			icon: '💳'
		}
	];

	const commissionTiers = [
		{ sales: '$0 - $1,000', rate: '5%', earnings: 'Up to $50' },
		{ sales: '$1,001 - $5,000', rate: '8%', earnings: 'Up to $400' },
		{ sales: '$5,001 - $10,000', rate: '10%', earnings: 'Up to $1,000' },
		{ sales: '$10,001+', rate: '15%', earnings: 'Unlimited' }
	];
</script>

<Section>
	<Container>
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<h1 class="text-5xl font-bold mb-4">Join Our Affiliate Program</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				Partner with Aevani and earn commissions by promoting sustainable agriculture
				products to your audience.
			</p>
		</div>

		<!-- Benefits Grid -->
		<Grid columns={3} gap={6} class="mb-16">
			{#each benefits as benefit}
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body items-center text-center">
						<span class="text-5xl mb-4">{benefit.icon}</span>
						<h3 class="card-title mb-2">{benefit.title}</h3>
						<p class="text-base-content/70">{benefit.description}</p>
					</div>
				</div>
			{/each}
		</Grid>

		<!-- Commission Structure -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-8">Commission Structure</h2>
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>Monthly Sales</th>
							<th>Commission Rate</th>
							<th>Potential Earnings</th>
						</tr>
					</thead>
					<tbody>
						{#each commissionTiers as tier}
							<tr>
								<td class="font-semibold">{tier.sales}</td>
								<td><span class="badge badge-primary badge-lg">{tier.rate}</span></td>
								<td class="font-semibold text-success">{tier.earnings}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- How It Works -->
		<div class="mb-16">
			<h2 class="text-3xl font-bold text-center mb-8">How It Works</h2>
			<div class="grid md:grid-cols-4 gap-6">
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						1
					</div>
					<h3 class="font-bold mb-2">Apply</h3>
					<p class="text-sm text-base-content/70">Fill out the application form below</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						2
					</div>
					<h3 class="font-bold mb-2">Get Approved</h3>
					<p class="text-sm text-base-content/70">Receive approval within 24-48 hours</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						3
					</div>
					<h3 class="font-bold mb-2">Promote</h3>
					<p class="text-sm text-base-content/70">Share your unique affiliate links</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
						4
					</div>
					<h3 class="font-bold mb-2">Earn</h3>
					<p class="text-sm text-base-content/70">Get paid monthly for your referrals</p>
				</div>
			</div>
		</div>

		<!-- Application CTA -->
		<div class="card bg-base-200 shadow-2xl">
			<div class="card-body text-center">
				<h2 class="card-title text-3xl justify-center mb-4">Ready to Get Started?</h2>
				<p class="text-base-content/70 mb-6">
					{#if data.user}
						{#if data.isAffiliate}
							You're already an affiliate! Visit your dashboard to manage your account.
						{:else}
							Apply now to become an Aevani affiliate and start earning.
						{/if}
					{:else}
						Sign in or create an account to apply for the affiliate program.
					{/if}
				</p>
				<div class="card-actions justify-center">
					{#if data.user}
						{#if data.isAffiliate}
							<a href="/affiliate/dashboard" class="btn btn-primary btn-lg">Go to Dashboard</a>
						{:else}
							<button class="btn btn-primary btn-lg">Apply Now</button>
						{/if}
					{:else}
						<a href="/auth/signin?redirect=/affiliate/join" class="btn btn-primary btn-lg">
							Sign In to Apply
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Terms Link -->
		<div class="text-center mt-8">
			<p class="text-sm text-base-content/60">
				By applying, you agree to our
				<a href="/affiliate/terms" class="link link-primary">Affiliate Terms & Conditions</a>
			</p>
		</div>
	</Container>
</Section>
