<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const helpCategories = [
		{
			title: 'Getting Started',
			icon: 'seedling',
			description: 'New to sustainable agriculture? Start here.',
			topics: [
				'Choosing the right system',
				'Setting up your first grow',
				'Essential equipment guide',
				'Beginner troubleshooting'
			]
		},
		{
			title: 'Product Support',
			icon: 'tools',
			description: 'Help with our products and equipment.',
			topics: [
				'Product manuals',
				'Installation guides',
				'Maintenance schedules',
				'Warranty information'
			]
		},
		{
			title: 'Account & Orders',
			icon: 'package',
			description: 'Manage your account and track orders.',
			topics: ['Track my order', 'Update account info', 'Order history', 'Payment methods']
		},
		{
			title: 'Technical Support',
			icon: 'wrench',
			description: 'Troubleshooting and technical assistance.',
			topics: [
				'System diagnostics',
				'Common issues',
				'Expert consultation',
				'Video tutorials'
			]
		},
		{
			title: 'Shipping & Returns',
			icon: 'truck',
			description: 'Information about delivery and returns.',
			topics: ['Shipping options', 'Return policy', 'Exchange process', 'Refund status']
		},
		{
			title: 'Affiliate Program',
			icon: 'briefcase',
			description: 'Support for our affiliate partners.',
			topics: ['Getting started', 'Link generation', 'Earnings tracking', 'Payment schedules']
		}
	];

	const popularArticles = [
		{ title: 'How to Set Up a Hydroponic System', views: 1250 },
		{ title: 'Troubleshooting Nutrient Deficiencies', views: 980 },
		{ title: 'Understanding pH Levels', views: 856 },
		{ title: 'Choosing the Right Grow Lights', views: 742 },
		{ title: 'Water Quality and Testing', views: 623 }
	];
</script>

<Section>
	<Container>
		<div class="text-center mb-12">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-4">Help Center</h1>
			<p class="text-lg text-base-content/70 max-w-2xl mx-auto">
				Find answers, guides, and expert support for all your sustainable agriculture needs.
			</p>
		</div>

		<!-- Search Bar -->
		<div class="max-w-2xl mx-auto mb-12">
			<div class="form-control">
				<div class="input-group">
					<input
						type="text"
						placeholder="Search for help..."
						class="input input-bordered w-full"
					/>
					<button class="btn btn-primary font-display uppercase tracking-wider">Search</button>
				</div>
			</div>
		</div>

		<!-- Help Categories -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each helpCategories as category}
				<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md hover:shadow-lg transition-shadow">
					<div class="card-body">
						<div class="mb-4">
							{#if category.icon === 'seedling'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M12 3c-4 4-8 9-8 14 0 3 2 5 5 5s5-2 5-5c0-5-4-10-8-14zM12 3v18"/>
								</svg>
							{:else if category.icon === 'tools'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.6-3.6a5 5 0 01-7.1 7.1L6 21l-3-3 8.2-8.2a5 5 0 017.1-7.1z"/>
								</svg>
							{:else if category.icon === 'package'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 22V11"/>
								</svg>
							{:else if category.icon === 'wrench'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.6-3.6a5 5 0 01-7.1 7.1L6 21l-3-3 8.2-8.2a5 5 0 017.1-7.1z"/>
								</svg>
							{:else if category.icon === 'truck'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M1 12h15v6H1v-6zM16 18h4l3-3v-3h-7v6zM5 21a2 2 0 100-4 2 2 0 000 4zM19 21a2 2 0 100-4 2 2 0 000 4z"/>
								</svg>
							{:else if category.icon === 'briefcase'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-10 h-10 text-primary">
									<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
								</svg>
							{/if}
						</div>
						<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Support</p>
						<h3 class="card-title font-display uppercase tracking-tight">{category.title}</h3>
						<p class="text-sm text-base-content/70 mb-4">{category.description}</p>
						<ul class="space-y-2">
							{#each category.topics as topic}
								<li>
									<a href="/help/articles/{topic.toLowerCase().replace(/\s+/g, '-')}" class="link link-hover text-sm">
										→ {topic}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</Grid>

		<!-- Popular Articles -->
		<div class="mb-12">
			<h2 class="text-2xl font-display uppercase tracking-tight mb-6">Popular Articles</h2>
			<div class="space-y-3">
				{#each popularArticles as article}
					<a href="/help/articles/{article.title.toLowerCase().replace(/\s+/g, '-')}"
						class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md hover:shadow-lg transition-shadow">
						<div class="card-body py-4">
							<div class="flex justify-between items-center">
								<h3 class="font-semibold">{article.title}</h3>
								<span class="font-mono text-xs uppercase tracking-widest text-secondary">{article.views} views</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Contact Support CTA -->
		<div class="grid md:grid-cols-2 gap-6">
			<div class="card bg-primary text-primary-content rounded-3xl border border-base-200/30 shadow-md">
				<div class="card-body">
					<h3 class="card-title font-display uppercase tracking-tight">Can't Find What You're Looking For?</h3>
					<p>Our support team is ready to help you with personalized assistance.</p>
					<div class="card-actions">
						<a href="/contact" class="btn btn-secondary font-display uppercase tracking-wider">Contact Support</a>
					</div>
				</div>
			</div>

			<div class="card bg-secondary text-secondary-content rounded-3xl border border-base-200/30 shadow-md">
				<div class="card-body">
					<h3 class="card-title font-display uppercase tracking-tight">Expert Consultation</h3>
					<p>Schedule a one-on-one session with our agriculture experts.</p>
					<div class="card-actions">
						<button class="btn btn-primary font-display uppercase tracking-wider">Book Consultation</button>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
