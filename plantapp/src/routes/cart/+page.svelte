<script lang="ts">
	import { formatMoney } from '$lib/commerce/contracts';
	import { MockCommerceNotice, ProductVisual } from '$lib/components/commerce';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData | null } = $props();
</script>

<svelte:head>
	<title>{data.context.isMock ? 'Test cart' : 'Cart'} | Aevani</title>
	{#if data.context.isMock}<meta name="robots" content="noindex,nofollow" />{/if}
</svelte:head>

{#if data.context.isMock}<MockCommerceNotice label={data.context.label} />{/if}

<main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<header>
		<p class="font-mono text-xs font-bold tracking-[0.16em] uppercase">
			{data.context.isMock ? 'Local test session' : 'Your selection'}
		</p>
		<h1 class="font-display mt-2 text-5xl font-bold uppercase md:text-7xl">
			{data.context.isMock ? 'Test cart' : 'Cart'}
		</h1>
	</header>
	{#if form?.message}
		<p class="mt-6 border border-error bg-base-100 p-4 text-sm text-error" role="alert">
			{form.message}
		</p>
	{/if}

	{#if data.cart.items.length}
		<div class="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
			<section class="space-y-4" aria-label="Cart items">
				{#each data.cart.items as item}
					<article
						class="grid gap-4 rounded-2xl border border-base-300 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center"
					>
						<div class="aspect-square overflow-hidden rounded-xl bg-base-200">
							<ProductVisual product={item.product} isMock={data.context.isMock} compact />
						</div>
						<div class="min-w-0">
							{#if data.context.isMock}<MockCommerceNotice
									compact
									label="Mock/test cart item"
								/>{/if}
							<a
								class="font-display mt-2 block text-xl font-bold uppercase"
								href="/products/{item.product.category.slug}/{item.product.slug}"
								>{item.product.name}</a
							>
							<p class="mt-1 text-sm text-base-content/65">
								{data.context.isMock ? 'Test price ' : ''}{formatMoney(item.unitPrice)} each
							</p>
						</div>
						<div class="flex flex-wrap items-end gap-2 sm:justify-end">
							<form method="POST" action="?/update" class="flex items-end gap-2">
								<input type="hidden" name="cartItemId" value={item.id} />
								<label class="form-control w-20">
									<span class="label-text text-xs">Qty</span>
									<input
										class="input-bordered input input-sm"
										name="quantity"
										type="number"
										min="0"
										max={Math.min(99, item.product.availableQuantity)}
										value={item.quantity}
									/>
								</label>
								<button class="btn btn-sm" type="submit">Update</button>
							</form>
							<form method="POST" action="?/remove">
								<input type="hidden" name="cartItemId" value={item.id} />
								<button class="btn btn-ghost btn-sm" type="submit">Remove</button>
							</form>
						</div>
					</article>
				{/each}
			</section>

			<aside class="h-fit rounded-2xl border border-base-300 p-6 lg:sticky lg:top-24">
				{#if data.context.isMock}<MockCommerceNotice compact label="Mock/test totals" />{/if}
				<div class="mt-4 flex items-center justify-between">
					<span>Subtotal</span>
					<strong class="font-mono">{formatMoney(data.cart.subtotal)}</strong>
				</div>
				<p class="mt-3 text-sm text-base-content/75">
					Tax and shipping are calculated in the checkout review.
				</p>
				<a class="btn mt-6 w-full btn-primary" href="/checkout"
					>{data.context.isMock ? 'Review test checkout' : 'Checkout'}</a
				>
				<form method="POST" action="?/clear" class="mt-3">
					<button class="btn w-full btn-ghost" type="submit"
						>Clear {data.context.isMock ? 'test cart' : 'cart'}</button
					>
				</form>
			</aside>
		</div>
	{:else}
		<section class="mt-10 rounded-2xl border border-base-300 p-10 text-center">
			<h2 class="font-display text-3xl font-bold uppercase">
				{data.context.isMock ? 'Your test cart is empty' : 'Your cart is empty'}
			</h2>
			<p class="mt-2 text-base-content/65">Add an item from the catalogue to continue.</p>
			<a class="btn mt-6 btn-primary" href="/products"
				>Browse {data.context.isMock ? 'test catalogue' : 'catalogue'}</a
			>
		</section>
	{/if}
</main>
