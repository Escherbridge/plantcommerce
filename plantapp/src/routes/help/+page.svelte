<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';

	const helpCategories = [
		{
			title: 'Getting Started',
			icon: '🌱',
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
			icon: '🛠️',
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
			icon: '📦',
			description: 'Manage your account and track orders.',
			topics: ['Track my order', 'Update account info', 'Order history', 'Payment methods']
		},
		{
			title: 'Technical Support',
			icon: '⚙️',
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
			icon: '🚚',
			description: 'Information about delivery and returns.',
			topics: ['Shipping options', 'Return policy', 'Exchange process', 'Refund status']
		},
		{
			title: 'Affiliate Program',
			icon: '💼',
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
			<h1 class="text-4xl font-bold mb-4">Help Center</h1>
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
					<button class="btn btn-primary">Search</button>
				</div>
			</div>
		</div>

		<!-- Help Categories -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each helpCategories as category}
				<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
					<div class="card-body">
						<span class="text-5xl mb-4">{category.icon}</span>
						<h3 class="card-title">{category.title}</h3>
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
			<h2 class="text-2xl font-bold mb-6">Popular Articles</h2>
			<div class="space-y-3">
				{#each popularArticles as article}
					<a href="/help/articles/{article.title.toLowerCase().replace(/\s+/g, '-')}"
						class="card bg-base-100 shadow hover:shadow-lg transition-shadow">
						<div class="card-body py-4">
							<div class="flex justify-between items-center">
								<h3 class="font-semibold">{article.title}</h3>
								<span class="text-sm text-base-content/60">{article.views} views</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Contact Support CTA -->
		<div class="grid md:grid-cols-2 gap-6">
			<div class="card bg-primary text-primary-content">
				<div class="card-body">
					<h3 class="card-title">Can't Find What You're Looking For?</h3>
					<p>Our support team is ready to help you with personalized assistance.</p>
					<div class="card-actions">
						<a href="/contact" class="btn btn-secondary">Contact Support</a>
					</div>
				</div>
			</div>

			<div class="card bg-secondary text-secondary-content">
				<div class="card-body">
					<h3 class="card-title">Expert Consultation</h3>
					<p>Schedule a one-on-one session with our agriculture experts.</p>
					<div class="card-actions">
						<button class="btn btn-primary">Book Consultation</button>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
