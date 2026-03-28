<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = [
		{
			title: 'Guides',
			description: 'Step-by-step tutorials for sustainable farming techniques and best practices',
			href: '/guides',
			bgStyle: 'background: linear-gradient(135deg, #1B2D4A, #2a4166)',
			iconPath: 'M4 6h10v36H6a2 2 0 01-2-2V8a2 2 0 012-2zm36 0H30v36h10a2 2 0 002-2V8a2 2 0 00-2-2zM18 6h12M18 42h12M10 14h6M10 20h6M10 26h4M30 14h6M30 20h6M30 26h4'
		},
		{
			title: 'Blog',
			description: 'Latest news, insights, and stories from our community of sustainable growers',
			href: '/blog',
			bgStyle: 'background: linear-gradient(135deg, #457B9D, #5a93b3)',
			iconPath: 'M8 6h28a2 2 0 012 2v28a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2zM14 14h16M14 20h16M14 26h10M6 6l4-3M38 6l-4-3'
		},
		{
			title: 'FAQ',
			description: 'Quick answers to the most common questions about our products and practices',
			href: '/faq',
			bgStyle: 'background: linear-gradient(135deg, #E63946, #eb5c67)',
			iconPath: 'M24 4a18 18 0 100 36 18 18 0 000-36zM24 28v0M20 16a4 4 0 118 0c0 2-2 3-4 4'
		},
		{
			title: 'Resources',
			description: 'Tools, calculators, downloadable guides, and community resources',
			href: '/resources',
			bgStyle: 'background: linear-gradient(135deg, #0A4B3E, #0d6352)',
			iconPath: 'M18 8l-8 8 8 8M26 8l8 8-8 8M8 36h28a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2v24a2 2 0 002 2z'
		}
	];
</script>

<svelte:head>
	<title>Learning Center | Aevani</title>
	<meta name="description" content="Everything you need to know about sustainable agriculture, hydroponics, aquaponics, and regenerative farming." />
</svelte:head>

<!-- Hero Section -->
<section class="bg-neutral w-full py-24 lg:py-32">
	<Container>
		<div class="text-center space-y-6">
			<span class="text-editorial text-secondary font-mono tracking-widest">KNOWLEDGE HUB</span>
			<h1 class="text-display font-display uppercase tracking-tight">Learning Center</h1>
			<p class="text-xl text-neutral-content/70 max-w-3xl mx-auto font-light leading-relaxed">
				Everything you need to know about sustainable agriculture, hydroponics, aquaponics, and
				regenerative farming
			</p>
		</div>
	</Container>
</section>

<section class="bg-base-100 w-full py-20 lg:py-28">
	<Container>
		<!-- Category Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-20">
			{#each categories as category}
				<a
					href={category.href}
					class="group relative overflow-hidden rounded-3xl p-8 lg:p-10 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] min-h-[200px] flex flex-col justify-between"
					style={category.bgStyle}
				>
					<div class="flex items-start justify-between">
						<div class="space-y-3 flex-1">
							<h3 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight">{category.title}</h3>
							<p class="text-white/80 text-base lg:text-lg font-light leading-relaxed max-w-sm">
								{category.description}
							</p>
						</div>
						<div class="ml-4 opacity-20 group-hover:opacity-30 transition-opacity">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-20 h-20 lg:w-24 lg:h-24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
								<path d={category.iconPath} />
							</svg>
						</div>
					</div>
					<div class="mt-6 flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
						<span>Explore</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Featured Guides -->
		{#if data.guides && data.guides.length > 0}
			<div class="mb-20">
				<div class="flex justify-between items-end mb-8">
					<div>
						<span class="text-editorial text-secondary font-mono tracking-widest">LEARN</span>
						<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight mt-2">Featured Guides</h2>
					</div>
					<a href="/guides" class="btn btn-outline btn-sm font-display uppercase tracking-wider">View All</a>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.guides as guide}
						<a href="/guides/{guide.slug}" class="group rounded-3xl bg-base-100 border border-base-200/30 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
							<div class="p-8">
								<span class="text-editorial text-secondary text-xs font-mono tracking-widest">GUIDE</span>
								<h3 class="font-display text-xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors">{guide.title}</h3>
								<p class="text-sm text-base-content/60 line-clamp-3 font-light leading-relaxed">{guide.excerpt || guide.content?.substring(0, 150) + '...'}</p>
								<div class="mt-6 flex items-center gap-2 text-primary text-sm font-medium">
									<span>Read More</span>
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Latest Blog Posts -->
		{#if data.blog && data.blog.length > 0}
			<div class="mb-20">
				<div class="flex justify-between items-end mb-8">
					<div>
						<span class="text-editorial text-secondary font-mono tracking-widest">INSIGHTS</span>
						<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight mt-2">Latest from Our Blog</h2>
					</div>
					<a href="/blog" class="btn btn-outline btn-sm font-display uppercase tracking-wider">View All</a>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.blog as post}
						<a href="/blog/{post.slug}" class="group rounded-3xl bg-base-100 border border-base-200/30 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
							<div class="p-8">
								<span class="text-editorial text-secondary text-xs font-mono tracking-widest">BLOG</span>
								<h3 class="font-display text-xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
								<p class="text-sm text-base-content/60 line-clamp-3 font-light leading-relaxed">{post.excerpt || post.content?.substring(0, 150) + '...'}</p>
								{#if post.publishedAt}
									<p class="text-xs text-base-content/40 font-mono mt-3">
										{new Date(post.publishedAt).toLocaleDateString()}
									</p>
								{/if}
								<div class="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
									<span>Read More</span>
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Popular FAQs -->
		{#if data.faqs && data.faqs.length > 0}
			<div class="mb-20">
				<div class="flex justify-between items-end mb-8">
					<div>
						<span class="text-editorial text-secondary font-mono tracking-widest">QUICK ANSWERS</span>
						<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight mt-2">Frequently Asked Questions</h2>
					</div>
					<a href="/faq" class="btn btn-outline btn-sm font-display uppercase tracking-wider">View All</a>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each data.faqs as faq}
						<a href="/faq#{faq.slug}" class="group rounded-2xl bg-base-100 border border-base-200/30 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
							<h3 class="font-semibold text-base-content group-hover:text-primary transition-colors">{faq.title}</h3>
							<p class="text-sm text-base-content/60 line-clamp-2 mt-2 font-light">
								{faq.excerpt || faq.content?.substring(0, 100) + '...'}
							</p>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Resources -->
		{#if data.resources && data.resources.length > 0}
			<div class="mb-16">
				<div class="flex justify-between items-end mb-8">
					<div>
						<span class="text-editorial text-secondary font-mono tracking-widest">TOOLS</span>
						<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight mt-2">Helpful Resources</h2>
					</div>
					<a href="/resources" class="btn btn-outline btn-sm font-display uppercase tracking-wider">View All</a>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.resources as resource}
						<a href="/resources/{resource.slug}" class="group rounded-3xl bg-base-100 border border-base-200/30 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
							<div class="p-8">
								<h3 class="font-display text-xl font-bold group-hover:text-primary transition-colors">{resource.title}</h3>
								<p class="text-sm text-base-content/60 line-clamp-2 mt-3 font-light">
									{resource.excerpt || resource.content?.substring(0, 100) + '...'}
								</p>
								<div class="mt-6 flex items-center gap-2 text-primary text-sm font-medium">
									<span>Access</span>
									<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Call to Action -->
		<div class="text-center">
			<div class="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-content p-12 lg:p-16 shadow-xl">
				<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight mb-4">Can't Find What You're Looking For?</h2>
				<p class="text-primary-content/80 mb-8 text-lg font-light">Our support team is here to help you succeed</p>
				<div class="flex flex-wrap gap-4 justify-center">
					<a href="/contact" class="btn btn-secondary btn-lg font-display uppercase tracking-wider">Contact Support</a>
					<a href="/help" class="btn btn-outline border-primary-content text-primary-content hover:bg-primary-content hover:text-primary btn-lg font-display uppercase tracking-wider">Visit Help Center</a>
				</div>
			</div>
		</div>
	</Container>
</section>
