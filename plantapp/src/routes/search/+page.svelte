<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const total = $derived(
		data.guides.length + data.posts.length + data.products.length + data.courses.length
	);
</script>

<svelte:head>
	<title>{data.q ? `Search: ${data.q}` : 'Search'} | Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="w-full bg-primary py-16 text-primary-content lg:py-24">
	<Container>
		<div class="mx-auto max-w-3xl space-y-6">
			<h1 class="font-display text-4xl font-bold tracking-tight uppercase lg:text-6xl">Search</h1>
			<form action="/search" method="get" class="flex flex-col gap-3 sm:flex-row" role="search">
				<label class="sr-only" for="site-search">Search guides, notes, and products</label>
				<input
					id="site-search"
					name="q"
					type="search"
					value={data.q}
					placeholder="Search guides, notes, and products"
					class="input w-full rounded-2xl bg-primary-content text-base-content"
				/>
				<button type="submit" class="btn rounded-2xl btn-secondary">Search</button>
			</form>
		</div>
	</Container>
</section>

<section class="w-full bg-base-100 py-16">
	<Container>
		{#if !data.q}
			<p class="text-base-content/70">
				Search published guides, field notes, courses, and products.
			</p>
		{:else if total === 0}
			<p class="text-base-content/70">No matches for “{data.q}”.</p>
		{:else}
			<div class="space-y-10">
				{#if data.guides.length > 0}
					<section>
						<h2 class="font-display mb-4 text-2xl font-bold tracking-tight uppercase">Guides</h2>
						<ul class="space-y-3">
							{#each data.guides as guide}
								<li>
									<a class="link text-lg" href="/guides/{guide.slug}">{guide.title}</a>
									{#if guide.excerpt}
										<p class="text-sm text-base-content/60">{guide.excerpt}</p>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}
				{#if data.posts.length > 0}
					<section>
						<h2 class="font-display mb-4 text-2xl font-bold tracking-tight uppercase">
							Field notes
						</h2>
						<ul class="space-y-3">
							{#each data.posts as post}
								<li>
									<a class="link text-lg" href="/blog/{post.slug}">{post.title}</a>
									{#if post.excerpt}
										<p class="text-sm text-base-content/60">{post.excerpt}</p>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}
				{#if data.courses.length > 0}
					<section>
						<h2 class="font-display mb-4 text-2xl font-bold tracking-tight uppercase">Courses</h2>
						<ul class="space-y-3">
							{#each data.courses as course}
								<li>
									<a class="link text-lg" href="/courses/{course.slug}">{course.title}</a>
									{#if course.description}
										<p class="text-sm text-base-content/60">{course.description}</p>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}
				{#if data.products.length > 0}
					<section>
						<h2 class="font-display mb-4 text-2xl font-bold tracking-tight uppercase">Products</h2>
						<ul class="space-y-3">
							{#each data.products as row}
								<li>
									<a class="link text-lg" href="/products/{row.category.slug}/{row.product.slug}">
										{row.product.name}
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</div>
		{/if}
	</Container>
</section>
