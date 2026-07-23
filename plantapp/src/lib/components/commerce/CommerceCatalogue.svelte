<script lang="ts">
	import type {
		CommerceCategory,
		CommerceContext,
		CommerceProduct,
		CommerceTag
	} from '$lib/commerce/contracts';
	import { formatMoney } from '$lib/commerce/contracts';
	import MockCommerceNotice from './MockCommerceNotice.svelte';
	import ProductVisual from './ProductVisual.svelte';

	const {
		context,
		products,
		categories,
		tags = [],
		search = '',
		selectedCategory = '',
		selectedTag = '',
		sort = 'created-desc'
	}: {
		context: CommerceContext;
		products: CommerceProduct[];
		categories: CommerceCategory[];
		tags?: CommerceTag[];
		search?: string;
		selectedCategory?: string;
		selectedTag?: string;
		sort?: string;
	} = $props();
</script>

{#if context.isMock}<MockCommerceNotice label={context.label} />{/if}

<section class="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
	<header class="max-w-3xl space-y-4">
		<p class="font-mono text-xs font-bold tracking-[0.18em] uppercase">
			{context.isMock ? 'Test catalogue' : 'Catalogue'}
		</p>
		<h1 class="font-display text-5xl leading-none tracking-tight uppercase md:text-7xl">
			Catalogue
		</h1>
		<p class="text-lg leading-relaxed text-base-content/70">
			{context.isMock
				? 'Exercise discovery, product detail, cart, and simulated checkout using clearly fictional local test data.'
				: 'Explore the current Aevani catalogue.'}
		</p>
	</header>

	<form
		action="/products"
		method="GET"
		class="mt-10 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)_minmax(11rem,15rem)_minmax(11rem,15rem)_auto]"
	>
		<label class="form-control">
			<span class="label-text mb-1 font-semibold">Search</span>
			<input
				class="input-bordered input w-full"
				name="search"
				value={search}
				placeholder="Search catalogue"
			/>
		</label>
		<label class="form-control">
			<span class="label-text mb-1 font-semibold">Category</span>
			<select class="select-bordered select w-full" name="category" value={selectedCategory}>
				<option value="">All categories</option>
				{#each categories as category}
					<option value={category.slug}>{category.name}</option>
				{/each}
			</select>
		</label>
		<label class="form-control">
			<span class="label-text mb-1 font-semibold">Tag</span>
			<select class="select-bordered select w-full" name="tag" value={selectedTag}>
				<option value="">All tags</option>
				{#each tags as tag}
					<option value={tag.slug}>{tag.name}</option>
				{/each}
			</select>
		</label>
		<label class="form-control">
			<span class="label-text mb-1 font-semibold">Sort</span>
			<select class="select-bordered select w-full" name="sort" value={sort}>
				<option value="created-desc">Newest</option>
				<option value="name-asc">Name A–Z</option>
				<option value="price-asc">Price low–high</option>
				<option value="price-desc">Price high–low</option>
			</select>
		</label>
		<button class="btn self-end btn-primary" type="submit">Apply</button>
	</form>

	<nav class="mt-6 flex flex-wrap gap-2" aria-label="Catalogue categories">
		<a
			class="btn whitespace-nowrap btn-sm"
			class:btn-primary={!selectedCategory}
			aria-current={!selectedCategory ? 'page' : undefined}
			href="/products">All</a
		>
		{#each categories as category}
			<a
				class="btn whitespace-nowrap btn-sm"
				class:btn-primary={selectedCategory === category.slug}
				aria-current={selectedCategory === category.slug ? 'page' : undefined}
				href="/products/{category.slug}">{category.name}</a
			>
		{/each}
	</nav>

	<div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each products as product}
			<article
				class="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100"
			>
				<a
					href="/products/{product.category.slug}/{product.slug}"
					class="block aspect-[4/3] bg-base-200"
				>
					<ProductVisual {product} isMock={context.isMock} />
				</a>
				<div class="flex flex-1 flex-col gap-3 p-5">
					{#if context.isMock}<MockCommerceNotice compact label="Mock/test item" />{/if}
					<p class="text-xs font-bold tracking-wider text-base-content/75 uppercase">
						{product.category.name}
					</p>
					{#if product.catalogDataClass === 'mock_test'}
						<p class="text-xs font-semibold tracking-wide text-warning uppercase">
							Illustrative mock/test catalogue data
						</p>
					{/if}
					<h2 class="font-display text-xl leading-tight font-bold uppercase">
						<a href="/products/{product.category.slug}/{product.slug}">{product.name}</a>
					</h2>
					<p class="line-clamp-3 flex-1 text-sm leading-relaxed text-base-content/70">
						{product.shortDescription ||
							'Product summary will be added as catalogue content is reviewed.'}
					</p>
					{#if product.tags?.length}
						<div class="flex flex-wrap gap-1.5" aria-label="Product tags">
							{#each product.tags.slice(0, 3) as tag}
								<a class="badge badge-outline" href="/products?tag={tag.slug}">{tag.name}</a>
							{/each}
						</div>
					{/if}
					<div class="flex items-end justify-between gap-3 border-t border-base-300 pt-4">
						<p>
							{#if context.isMock}<span class="block text-xs font-bold uppercase">Test price</span
								>{/if}
							<strong class="font-mono text-lg">{formatMoney(product.price)}</strong>
						</p>
						<a
							class="btn btn-sm btn-primary"
							href="/products/{product.category.slug}/{product.slug}">Details</a
						>
					</div>
				</div>
			</article>
		{:else}
			<div class="col-span-full rounded-2xl border border-base-300 p-10 text-center">
				<h2 class="font-display text-2xl font-bold uppercase">No matching products</h2>
				<p class="mt-2 text-base-content/65">Try a different search or category.</p>
			</div>
		{/each}
	</div>
</section>
