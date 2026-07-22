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
			<p class="text-lg leading-relaxed text-base-content/75">{data.product.description}</p>
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
