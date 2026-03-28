<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const benefits = [
		{
			title: 'Competitive Commissions',
			description: 'Earn up to 15% commission on all referred sales with our tiered system',
			iconPath: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v4l2 2M8 14h8'
		},
		{
			title: 'Marketing Materials',
			description: 'Access professional banners, images, and content to promote our products',
			iconPath: 'M4 4h16v12H4zM8 20h8M12 16v4M7 8h2M7 11h4M13 8h4v3h-4z'
		},
		{
			title: 'Real-time Analytics',
			description: 'Track clicks, conversions, and earnings with our comprehensive dashboard',
			iconPath: 'M3 20h18M6 16v4M10 12v8M14 8v12M18 4v16'
		},
		{
			title: 'Dedicated Support',
			description: 'Get help from our affiliate team to maximize your earning potential',
			iconPath: 'M17 8a5 5 0 00-10 0c0 4 5 8 5 12 0-4 5-8 5-12zM12 20v2M8 22h8'
		},
		{
			title: 'Cookie Duration',
			description: '30-day cookie window ensures you get credit for all referred customers',
			iconPath: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2M2 12h2M20 12h2M12 2v2M12 20v2'
		},
		{
			title: 'Monthly Payouts',
			description: 'Receive timely payments via PayPal, bank transfer, or check',
			iconPath: 'M2 7h20v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM22 7l-2-4H4L2 7M8 12h8M8 15h5'
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
		<div class="text-center mb-16">
			<span class="text-editorial text-secondary font-mono tracking-widest">PARTNER WITH US</span>
			<h1 class="font-display text-5xl lg:text-7xl font-bold uppercase tracking-tight mt-3 mb-6">Join Our Affiliate Program</h1>
			<p class="text-xl text-base-content/60 max-w-3xl mx-auto font-light leading-relaxed">
				Partner with Aevani and earn commissions by promoting sustainable agriculture
				products to your audience.
			</p>
		</div>

		<!-- Benefits Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
			{#each benefits as benefit}
				<div class="group rounded-3xl bg-base-100 border border-base-200/30 p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
					<div class="mb-6">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-10 h-10 text-primary" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d={benefit.iconPath} />
						</svg>
					</div>
					<h3 class="font-display text-xl font-bold uppercase tracking-tight mb-3">{benefit.title}</h3>
					<p class="text-base-content/60 text-sm font-light leading-relaxed">{benefit.description}</p>
				</div>
			{/each}
		</div>

		<!-- Commission Structure -->
		<div class="mb-16">
			<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight text-center mb-8">Commission Structure</h2>
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
						<a href="/login?redirect=/affiliate/join" class="btn btn-primary btn-lg">
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
