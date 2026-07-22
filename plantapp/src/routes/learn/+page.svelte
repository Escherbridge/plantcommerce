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
			iconPath:
				'M4 6h10v36H6a2 2 0 01-2-2V8a2 2 0 012-2zm36 0H30v36h10a2 2 0 002-2V8a2 2 0 00-2-2zM18 6h12M18 42h12M10 14h6M10 20h6M10 26h4M30 14h6M30 20h6M30 26h4'
		},
		{
			title: 'Blog',
			description: 'Latest news, insights, and stories from our community of sustainable growers',
			href: '/blog',
			bgStyle: 'background: linear-gradient(135deg, #457B9D, #5a93b3)',
			iconPath:
				'M8 6h28a2 2 0 012 2v28a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2zM14 14h16M14 20h16M14 26h10M6 6l4-3M38 6l-4-3'
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
			iconPath:
				'M18 8l-8 8 8 8M26 8l8 8-8 8M8 36h28a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2v24a2 2 0 002 2z'
		}
	];
</script>

<svelte:head>
	<title>Learning Center | Aevani</title>
	<meta
		name="description"
		content="Everything you need to know about sustainable agriculture, hydroponics, aquaponics, and regenerative farming."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="w-full bg-primary py-24 text-primary-content lg:py-32">
	<Container>
		<div class="space-y-6 text-center">
			<span class="text-editorial font-mono tracking-widest text-secondary">KNOWLEDGE HUB</span>
			<h1 class="text-display font-display tracking-tight uppercase">Learning Center</h1>
			<p class="mx-auto max-w-3xl text-xl leading-relaxed font-light text-primary-content/70">
				Everything you need to know about sustainable agriculture, hydroponics, aquaponics, and
				regenerative farming
			</p>
		</div>
	</Container>
</section>

<section class="w-full bg-base-100 py-20 lg:py-28">
	<Container>
		<!-- Category Cards -->
		<div class="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
			{#each categories as category}
				<a
					href={category.href}
					class="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-3xl p-8 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl lg:p-10"
					style={category.bgStyle}
				>
					<div class="flex items-start justify-between">
						<div class="flex-1 space-y-3">
							<h3 class="font-display text-3xl font-bold tracking-tight uppercase lg:text-4xl">
								{category.title}
							</h3>
							<p class="max-w-sm text-base leading-relaxed font-light text-white/80 lg:text-lg">
								{category.description}
							</p>
						</div>
						<div class="ml-4 opacity-20 transition-opacity group-hover:opacity-30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 48 48"
								class="h-20 w-20 lg:h-24 lg:w-24"
								fill="none"
								stroke="currentColor"
								stroke-width="1"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d={category.iconPath} />
							</svg>
						</div>
					</div>
					<div class="mt-6 flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
						<span>Explore</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4 transition-transform group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Featured Guides -->
		{#if data.guides && data.guides.length > 0}
			<div class="mb-20">
				<div class="mb-8 flex items-end justify-between">
					<div>
						<span class="text-editorial font-mono tracking-widest text-secondary">LEARN</span>
						<h2 class="font-display mt-2 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
							Featured Guides
						</h2>
					</div>
					<a href="/guides" class="font-display btn tracking-wider uppercase btn-outline btn-sm"
						>View All</a
					>
				</div>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.guides as guide}
						<a
							href="/guides/{guide.slug}"
							class="group overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:border-primary/20 hover:shadow-xl"
						>
							<div class="p-8">
								<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
									>GUIDE</span
								>
								<h3
									class="font-display mt-2 mb-3 text-xl font-bold transition-colors group-hover:text-primary"
								>
									{guide.title}
								</h3>
								<p class="line-clamp-3 text-sm leading-relaxed font-light text-base-content/60">
									{guide.excerpt || guide.content?.substring(0, 150) + '...'}
								</p>
								<div class="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
									<span>Read More</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 transition-transform group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M14 5l7 7m0 0l-7 7m7-7H3"
										/></svg
									>
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
				<div class="mb-8 flex items-end justify-between">
					<div>
						<span class="text-editorial font-mono tracking-widest text-secondary">INSIGHTS</span>
						<h2 class="font-display mt-2 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
							Latest from Our Blog
						</h2>
					</div>
					<a href="/blog" class="font-display btn tracking-wider uppercase btn-outline btn-sm"
						>View All</a
					>
				</div>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.blog as post}
						<a
							href="/blog/{post.slug}"
							class="group overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:border-primary/20 hover:shadow-xl"
						>
							<div class="p-8">
								<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
									>BLOG</span
								>
								<h3
									class="font-display mt-2 mb-3 text-xl font-bold transition-colors group-hover:text-primary"
								>
									{post.title}
								</h3>
								<p class="line-clamp-3 text-sm leading-relaxed font-light text-base-content/60">
									{post.excerpt || post.content?.substring(0, 150) + '...'}
								</p>
								{#if post.publishedAt}
									<p class="mt-3 font-mono text-xs text-base-content/40">
										{new Date(post.publishedAt).toLocaleDateString()}
									</p>
								{/if}
								<div class="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
									<span>Read More</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 transition-transform group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M14 5l7 7m0 0l-7 7m7-7H3"
										/></svg
									>
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
				<div class="mb-8 flex items-end justify-between">
					<div>
						<span class="text-editorial font-mono tracking-widest text-secondary"
							>QUICK ANSWERS</span
						>
						<h2 class="font-display mt-2 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
							Frequently Asked Questions
						</h2>
					</div>
					<a href="/faq" class="font-display btn tracking-wider uppercase btn-outline btn-sm"
						>View All</a
					>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each data.faqs as faq}
						<a
							href="/faq#{faq.slug}"
							class="group rounded-2xl border border-base-200/30 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
						>
							<h3
								class="font-semibold text-base-content transition-colors group-hover:text-primary"
							>
								{faq.title}
							</h3>
							<p class="mt-2 line-clamp-2 text-sm font-light text-base-content/60">
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
				<div class="mb-8 flex items-end justify-between">
					<div>
						<span class="text-editorial font-mono tracking-widest text-secondary">TOOLS</span>
						<h2 class="font-display mt-2 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
							Helpful Resources
						</h2>
					</div>
					<a href="/resources" class="font-display btn tracking-wider uppercase btn-outline btn-sm"
						>View All</a
					>
				</div>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.resources as resource}
						<a
							href="/resources/{resource.slug}"
							class="group overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:border-primary/20 hover:shadow-xl"
						>
							<div class="p-8">
								<h3
									class="font-display text-xl font-bold transition-colors group-hover:text-primary"
								>
									{resource.title}
								</h3>
								<p class="mt-3 line-clamp-2 text-sm font-light text-base-content/60">
									{resource.excerpt || resource.content?.substring(0, 100) + '...'}
								</p>
								<div class="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
									<span>Access</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 transition-transform group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M14 5l7 7m0 0l-7 7m7-7H3"
										/></svg
									>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Call to Action -->
		<div class="text-center">
			<div
				class="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-primary-content shadow-xl lg:p-16"
			>
				<h2 class="font-display mb-4 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
					Can't Find What You're Looking For?
				</h2>
				<p class="mb-8 text-lg font-light text-primary-content/80">
					Our support team is here to help you succeed
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a href="/contact" class="font-display btn tracking-wider uppercase btn-lg btn-secondary"
						>Contact Support</a
					>
					<a
						href="/help"
						class="font-display btn border-primary-content tracking-wider text-primary-content uppercase btn-outline btn-lg hover:bg-primary-content hover:text-primary"
						>Visit Help Center</a
					>
				</div>
			</div>
		</div>
	</Container>
</section>
