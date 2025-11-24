<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = [
		{
			title: 'Guides',
			description: 'Step-by-step tutorials for sustainable farming',
			href: '/guides',
			icon: '📚',
			color: 'bg-primary'
		},
		{
			title: 'Blog',
			description: 'Latest news and insights from our experts',
			href: '/blog',
			icon: '✍️',
			color: 'bg-secondary'
		},
		{
			title: 'FAQ',
			description: 'Answers to common questions',
			href: '/faq',
			icon: '❓',
			color: 'bg-accent'
		},
		{
			title: 'Resources',
			description: 'Tools, calculators, and downloads',
			href: '/resources',
			icon: '🛠️',
			color: 'bg-info'
		}
	];
</script>

<Section>
	<Container>
		<div class="mb-12 text-center">
			<h1 class="text-5xl font-bold mb-4">Learning Center</h1>
			<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
				Everything you need to know about sustainable agriculture, hydroponics, aquaponics, and
				regenerative farming
			</p>
		</div>

		<!-- Category Cards -->
		<Grid columns={4} gap={6} class="mb-16">
			{#each categories as category}
				<a href={category.href} class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
					<div class="card-body items-center text-center">
						<div class="text-6xl mb-4">{category.icon}</div>
						<h3 class="card-title">{category.title}</h3>
						<p class="text-sm text-base-content/70">{category.description}</p>
						<div class="card-actions mt-4">
							<button class="btn btn-primary btn-sm">Explore</button>
						</div>
					</div>
				</a>
			{/each}
		</Grid>

		<!-- Featured Guides -->
		{#if data.guides && data.guides.length > 0}
			<div class="mb-16">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-3xl font-bold">Featured Guides</h2>
					<a href="/guides" class="btn btn-outline">View All</a>
				</div>
				<Grid columns={3} gap={6}>
					{#each data.guides as guide}
						<a href="/guides/{guide.slug}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
							<div class="card-body">
								<h3 class="card-title">{guide.title}</h3>
								<p class="text-sm text-base-content/70 line-clamp-3">{guide.excerpt || guide.content?.substring(0, 150) + '...'}</p>
								<div class="card-actions justify-end mt-4">
									<button class="btn btn-primary btn-sm">Read More</button>
								</div>
							</div>
						</a>
					{/each}
				</Grid>
			</div>
		{/if}

		<!-- Latest Blog Posts -->
		{#if data.blog && data.blog.length > 0}
			<div class="mb-16">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-3xl font-bold">Latest from Our Blog</h2>
					<a href="/blog" class="btn btn-outline">View All</a>
				</div>
				<Grid columns={3} gap={6}>
					{#each data.blog as post}
						<a href="/blog/{post.slug}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
							<div class="card-body">
								<h3 class="card-title">{post.title}</h3>
								<p class="text-sm text-base-content/70 line-clamp-3">{post.excerpt || post.content?.substring(0, 150) + '...'}</p>
								{#if post.publishedAt}
									<p class="text-xs text-base-content/50">
										{new Date(post.publishedAt).toLocaleDateString()}
									</p>
								{/if}
								<div class="card-actions justify-end mt-4">
									<button class="btn btn-primary btn-sm">Read More</button>
								</div>
							</div>
						</a>
					{/each}
				</Grid>
			</div>
		{/if}

		<!-- Popular FAQs -->
		{#if data.faqs && data.faqs.length > 0}
			<div class="mb-16">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-3xl font-bold">Frequently Asked Questions</h2>
					<a href="/faq" class="btn btn-outline">View All</a>
				</div>
				<Grid columns={2} gap={4}>
					{#each data.faqs as faq}
						<a href="/faq#{faq.slug}" class="card bg-base-100 shadow hover:shadow-lg transition-shadow">
							<div class="card-body">
								<h3 class="font-semibold">{faq.title}</h3>
								<p class="text-sm text-base-content/70 line-clamp-2">
									{faq.excerpt || faq.content?.substring(0, 100) + '...'}
								</p>
							</div>
						</a>
					{/each}
				</Grid>
			</div>
		{/if}

		<!-- Resources -->
		{#if data.resources && data.resources.length > 0}
			<div>
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-3xl font-bold">Helpful Resources</h2>
					<a href="/resources" class="btn btn-outline">View All</a>
				</div>
				<Grid columns={3} gap={6}>
					{#each data.resources as resource}
						<a href="/resources/{resource.slug}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
							<div class="card-body">
								<h3 class="card-title">{resource.title}</h3>
								<p class="text-sm text-base-content/70 line-clamp-2">
									{resource.excerpt || resource.content?.substring(0, 100) + '...'}
								</p>
								<div class="card-actions justify-end mt-4">
									<button class="btn btn-primary btn-sm">Access</button>
								</div>
							</div>
						</a>
					{/each}
				</Grid>
			</div>
		{/if}

		<!-- Call to Action -->
		<div class="mt-16 text-center">
			<div class="card bg-primary text-primary-content shadow-2xl">
				<div class="card-body items-center">
					<h2 class="card-title text-3xl mb-4">Can't Find What You're Looking For?</h2>
					<p class="mb-6">Our support team is here to help you succeed</p>
					<div class="card-actions">
						<a href="/contact" class="btn btn-secondary">Contact Support</a>
						<a href="/help" class="btn btn-outline btn-secondary">Visit Help Center</a>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
