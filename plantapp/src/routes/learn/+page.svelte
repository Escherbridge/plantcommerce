<script lang="ts">
	import { Container, Section, Grid } from '$lib/components/layout';
	import type { PageData } from './$types';
	import { Icon, type IconName } from '$lib/components/icons';

	let { data }: { data: PageData } = $props();

	const categories = [
		{
			title: 'Guides',
			description:
				'The notes we can stand behind, starting with soil health and companion planting.',
			href: '/guides',
			surfaceClass: 'bg-primary text-primary-content',
			icon: 'book-open' as IconName
		},
		{
			title: 'Field notes',
			description: 'Occasional writing. Not a community newspaper, and not a product blog.',
			href: '/blog',
			surfaceClass: 'bg-neutral text-neutral-content',
			icon: 'clipboard-list' as IconName
		},
		{
			title: 'FAQ',
			description:
				'Short answers. If a question is about buying, shipping, or returns, the honest answer today is that nothing is for sale.',
			href: '/faq',
			surfaceClass: 'bg-secondary text-secondary-content',
			icon: 'help-circle' as IconName
		},
		{
			title: 'Resources',
			description: 'This shelf is empty for now.',
			href: '/resources',
			surfaceClass: 'border border-base-300 bg-base-200 text-base-content',
			icon: 'code' as IconName
		}
	];

	const buyingFaq = {
		title: 'Can I buy something today?',
		excerpt:
			'No. The catalogue is a preview. Checkout is off. If you grow or make something that belongs here, apply to sell.'
	};
</script>

<svelte:head>
	<title>Learn — Aevani</title>
	<meta
		name="description"
		content="Short guides and notes on soil, companion planting, hydroponics, aquaponics, and silvopasture. Free, no account. This is not a complete library, and it does not sell you a kit at the end."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="w-full bg-primary py-24 text-primary-content lg:py-32">
	<Container>
		<div class="space-y-6 text-center">
			<span class="text-editorial font-mono tracking-widest text-secondary">LEARN</span>
			<h1 class="text-display font-display tracking-tight">Guides and notes</h1>
			<p class="mx-auto max-w-3xl text-xl leading-relaxed font-light text-primary-content/70">
				Short guides and notes on soil, companion planting, hydroponics, aquaponics, and
				silvopasture. Free, no account. This is not a complete library, and it does not sell you a
				kit at the end.
			</p>
			<form
				action="/search"
				method="get"
				class="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
			>
				<label class="sr-only" for="learn-search">Search guides, notes, and products</label>
				<input
					id="learn-search"
					name="q"
					type="search"
					placeholder="Search guides, notes, and products"
					class="input w-full rounded-2xl bg-primary-content text-base-content"
				/>
				<button type="submit" class="btn rounded-2xl btn-secondary">Search</button>
			</form>
			<p>
				<a href="/search" class="link text-sm text-primary-content/80">Search the library</a>
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
					class="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-xl p-8 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md lg:p-10 {category.surfaceClass}"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1 space-y-3">
							<h3 class="font-display text-3xl font-bold tracking-tight uppercase lg:text-4xl">
								{category.title}
							</h3>
							<p class="max-w-sm text-base leading-relaxed opacity-75 lg:text-lg">
								{category.description}
							</p>
						</div>
						<div class="ml-4 opacity-40 transition-opacity group-hover:opacity-60">
							<Icon name={category.icon} size={96} class="h-20 w-20 lg:h-24 lg:w-24" />
						</div>
					</div>
					<div class="mt-6 flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
						<span>Explore</span>
						<Icon
							name="arrow-right"
							size={16}
							class="transition-transform group-hover:translate-x-1"
						/>
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
									{guide.excerpt ?? 'No summary is available yet.'}
								</p>
								<div class="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
									<span>Read More</span>
									<Icon
										name="arrow-right"
										size={16}
										class="transition-transform group-hover:translate-x-1"
									/>
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
							Field notes
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
									{post.excerpt ?? 'No summary is available yet.'}
								</p>
								{#if post.publishedAt}
									<p class="mt-3 font-mono text-xs text-base-content/40">
										{new Date(post.publishedAt).toLocaleDateString()}
									</p>
								{/if}
								<div class="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
									<span>Read More</span>
									<Icon
										name="arrow-right"
										size={16}
										class="transition-transform group-hover:translate-x-1"
									/>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Popular FAQs -->
		<div class="mb-20">
			<div class="mb-8 flex items-end justify-between">
				<div>
					<span class="text-editorial font-mono tracking-widest text-secondary">QUICK ANSWERS</span>
					<h2 class="font-display mt-2 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
						Frequently Asked Questions
					</h2>
				</div>
				<a href="/faq" class="font-display btn tracking-wider uppercase btn-outline btn-sm"
					>View All</a
				>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<a
					href="/sell"
					class="group rounded-2xl border border-base-200/30 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
				>
					<h3 class="font-semibold text-base-content transition-colors group-hover:text-primary">
						{buyingFaq.title}
					</h3>
					<p class="mt-2 line-clamp-2 text-sm font-light text-base-content/60">
						{buyingFaq.excerpt}
					</p>
				</a>
				{#each data.faqs as faq}
					<a
						href="/faq#{faq.slug}"
						class="group rounded-2xl border border-base-200/30 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
					>
						<h3 class="font-semibold text-base-content transition-colors group-hover:text-primary">
							{faq.title}
						</h3>
						<p class="mt-2 line-clamp-2 text-sm font-light text-base-content/60">
							{faq.excerpt ?? 'No summary is available yet.'}
						</p>
					</a>
				{/each}
			</div>
		</div>

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
									{resource.excerpt ?? 'No summary is available yet.'}
								</p>
								<div class="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
									<span>Access</span>
									<Icon
										name="arrow-right"
										size={16}
										class="transition-transform group-hover:translate-x-1"
									/>
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
				class="rounded-xl border border-primary-content/10 bg-primary p-12 text-primary-content shadow-md lg:p-16"
			>
				<h2 class="font-display mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
					If a guide is missing, write to us.
				</h2>
				<div class="flex flex-wrap justify-center gap-4">
					<a href="/contact" class="font-display btn tracking-wider uppercase btn-lg btn-secondary"
						>Contact</a
					>
					<a
						href="/sell"
						class="font-display btn border-primary-content bg-transparent tracking-wider text-primary-content uppercase btn-lg hover:bg-primary-content hover:text-primary"
						>Sell on Aevani</a
					>
				</div>
			</div>
		</div>
	</Container>
</section>
