<script lang="ts">
	import { formatMoney } from '$lib/commerce/contracts';
	import { MockCommerceNotice, ProductVisual } from '$lib/components/commerce';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData | null } = $props();
</script>

<svelte:head>
	<title>{data.product.name} | Aevani</title>
	<meta name="description" content={data.product.shortDescription} />
	{#if data.context.isMock}<meta name="robots" content="noindex,nofollow" />{/if}
</svelte:head>

{#if data.context.isMock}<MockCommerceNotice label={data.context.label} />{/if}

<main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<nav class="mb-8 text-sm" aria-label="Breadcrumb">
		<a class="link" href="/products">Catalogue</a>
		<span aria-hidden="true"> / </span>
		<a class="link" href="/products/{data.product.category.slug}">{data.product.category.name}</a>
		<span aria-hidden="true"> / </span>
		<span aria-current="page">{data.product.name}</span>
	</nav>

	<div class="grid gap-8 lg:grid-cols-2 lg:gap-14">
		<div class="aspect-square overflow-hidden rounded-2xl bg-base-200">
			<ProductVisual product={data.product} isMock={data.context.isMock} />
		</div>

		<section class="space-y-6">
			{#if data.context.isMock}<MockCommerceNotice compact label="Mock/test product detail" />{/if}
			<p class="text-xs font-bold tracking-[0.16em] uppercase">{data.product.category.name}</p>
			<h1 class="font-display text-4xl leading-none font-bold tracking-tight uppercase md:text-6xl">
				{data.product.name}
			</h1>
			<p class="text-lg leading-relaxed text-base-content/75">
				{data.product.description ||
					'A fuller product description will be added as catalogue content is reviewed.'}
			</p>
			{#if data.product.catalogDataClass === 'mock_test'}
				<div class="border border-warning/60 bg-warning/10 p-4 text-sm" role="note">
					<p class="font-semibold uppercase">Illustrative mock/test catalogue data</p>
					<p class="mt-1 text-base-content/75">
						{data.product.catalogDisclosure ||
							'Supplier, manufacturer, media rights, and offer details are not verified.'}
					</p>
				</div>
			{/if}

			<section
				class="grid gap-3 border-y border-base-300 py-5 sm:grid-cols-2"
				aria-label="Product metadata"
			>
				<div>
					<p class="text-xs font-bold tracking-wider text-base-content/60 uppercase">
						Manufacturer
					</p>
					<p class="mt-1 font-semibold">
						{data.product.manufacturers?.[0]?.name || 'Manufacturer details not supplied'}
					</p>
					{#if data.product.manufacturers?.[0]?.status !== 'verified'}
						<p class="text-xs text-base-content/60">Verification status unavailable</p>
					{/if}
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-base-content/60 uppercase">
						Product type
					</p>
					<p class="mt-1 font-semibold">
						{data.product.facets?.find((facet) => facet.key === 'product-kind')?.value ||
							'Product type not supplied'}
					</p>
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-base-content/60 uppercase">
						Growing system
					</p>
					<p class="mt-1 font-semibold">
						{data.product.facets?.find((facet) => facet.key === 'growing-system')?.value ||
							'Growing system not specified'}
					</p>
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-base-content/60 uppercase">SKU</p>
					<p class="mt-1 font-mono text-sm">{data.product.sku || 'SKU not supplied'}</p>
				</div>
			</section>

			<div class="space-y-4">
				<div>
					<p class="text-xs font-bold tracking-wider text-base-content/60 uppercase">Categories</p>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each data.product.categories?.length ? data.product.categories : [data.product.category] as category}
							<a class="badge badge-outline" href="/products/{category.slug}">{category.name}</a>
						{:else}
							<span class="text-sm text-base-content/60">Category details not supplied</span>
						{/each}
					</div>
				</div>
				<div>
					<p class="text-xs font-bold tracking-wider text-base-content/60 uppercase">Tags</p>
					<div class="mt-2 flex flex-wrap gap-2">
						{#if data.product.tags?.length}
							{#each data.product.tags as tag}
								<a class="badge badge-ghost" href="/products?tag={tag.slug}">{tag.name}</a>
							{/each}
						{:else}
							<span class="text-sm text-base-content/60"
								>Tags will appear as the catalogue is enriched.</span
							>
						{/if}
					</div>
				</div>
			</div>
			{#if form?.message}
				<p class="border border-error bg-base-100 p-4 text-sm text-error" role="alert">
					{form.message}
				</p>
			{/if}
			<div class="border-y border-base-300 py-5">
				{#if data.context.isMock}<span class="block text-xs font-bold tracking-wider uppercase"
						>Test price</span
					>{/if}
				<strong class="font-mono text-3xl">{formatMoney(data.product.price)}</strong>
				<p class="mt-2 text-sm text-base-content/65">
					{data.context.isMock
						? `${data.product.availableQuantity} simulated units for interface testing`
						: data.product.inStock
							? 'In stock'
							: 'Out of stock'}
				</p>
			</div>

			<form method="POST" action="?/add" class="flex flex-wrap items-end gap-3">
				<input type="hidden" name="productId" value={data.product.id} />
				<label class="form-control w-28">
					<span class="label-text mb-1 font-semibold">Quantity</span>
					<input
						class="input-bordered input"
						name="quantity"
						type="number"
						min="1"
						max={Math.max(1, Math.min(99, data.product.availableQuantity))}
						value="1"
						disabled={!data.product.inStock}
					/>
				</label>
				<button class="btn btn-primary" type="submit" disabled={!data.product.inStock}>
					{data.context.isMock ? 'Add to test cart' : 'Add to cart'}
				</button>
			</form>
			{#if data.context.isMock}
				<p class="rounded-xl border border-base-300 p-4 text-sm">
					This action changes only a short-lived local test session. It does not reserve inventory.
				</p>
			{/if}
		</section>
	</div>

	<section class="mt-14 grid gap-8 border-t border-base-300 pt-10 lg:grid-cols-[1fr_1fr]">
		<div>
			<h2 class="font-display text-2xl font-bold uppercase">Growing context</h2>
			<div class="mt-4 flex flex-wrap gap-2">
				{#if data.product.contentAreas?.length}
					{#each data.product.contentAreas as area}<span class="badge badge-primary"
							>{area.name}</span
						>{/each}
				{:else}
					<p class="text-sm text-base-content/65">
						Content areas will be added as editorial relationships are reviewed.
					</p>
				{/if}
			</div>
			{#if data.product.facets?.length}
				<dl class="mt-5 space-y-2 text-sm">
					{#each data.product.facets as facet}
						<div class="flex justify-between gap-4 border-b border-base-300 py-2">
							<dt class="text-base-content/65">{facet.name}</dt>
							<dd class="font-semibold">{facet.value}</dd>
						</div>
					{/each}
				</dl>
			{/if}
		</div>
		<div>
			<h2 class="font-display text-2xl font-bold uppercase">Guides & related content</h2>
			<div class="mt-4 space-y-3">
				{#if data.product.guides?.length}
					{#each data.product.guides as guide}
						<a
							class="block border border-base-300 p-4 transition-colors hover:border-primary"
							href="/guides/{guide.slug}"
						>
							<span class="text-xs font-bold tracking-wider text-base-content/60 uppercase"
								>{guide.type}</span
							>
							<span class="mt-1 block font-semibold">{guide.title}</span>
						</a>
					{/each}
				{:else}
					<p class="border border-dashed border-base-300 p-4 text-sm text-base-content/65">
						No related guides are linked yet. Browse the <a class="link" href="/guides"
							>growing guides</a
						> while this content area is being reviewed.
					</p>
				{/if}
			</div>
		</div>
	</section>

	{#if data.relatedProducts.length}
		<section class="mt-16">
			<h2 class="font-display text-3xl font-bold uppercase">
				Related {data.context.isMock ? 'test items' : 'products'}
			</h2>
			<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each data.relatedProducts as product}
					<a
						class="rounded-xl border border-base-300 p-4 hover:border-primary"
						href="/products/{product.category.slug}/{product.slug}"
					>
						<span class="font-display font-bold uppercase">{product.name}</span>
						<span class="mt-2 block font-mono text-sm"
							>{data.context.isMock ? 'Test price ' : ''}{formatMoney(product.price)}</span
						>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</main>
