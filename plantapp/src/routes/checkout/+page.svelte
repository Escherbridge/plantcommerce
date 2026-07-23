<script lang="ts">
	import { formatMoney } from '$lib/commerce/contracts';
	import { MockCommerceNotice } from '$lib/components/commerce';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.context.isMock ? 'Test checkout review' : 'Checkout review'} | Aevani</title>
	{#if data.context.isMock}<meta name="robots" content="noindex,nofollow" />{/if}
</svelte:head>

{#if data.context.isMock}<MockCommerceNotice label={data.context.label} />{/if}

<main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<header class="max-w-3xl">
		<p class="font-mono text-xs font-bold tracking-[0.16em] uppercase">
			{data.context.isMock ? 'Simulation step' : 'Secure checkout'}
		</p>
		<h1 class="font-display mt-2 text-5xl font-bold uppercase md:text-7xl">
			{data.context.isMock ? 'Test checkout review' : 'Checkout review'}
		</h1>
		{#if data.context.isMock}
			<p class="mt-4 text-lg leading-relaxed text-base-content/70">
				Do not enter personal or payment information. This review uses fixed fictional contact,
				address, tax, shipping, and price data.
			</p>
		{/if}
	</header>

	<div class="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
		<section class="space-y-6">
			{#if data.context.isMock}<MockCommerceNotice compact label="Mock/test checkout" />{/if}
			<div class="rounded-2xl border border-base-300 p-6">
				<h2 class="font-display text-2xl font-bold uppercase">Items</h2>
				<ul class="mt-4 divide-y divide-base-300">
					{#each data.review.cart.items as item}
						<li class="flex justify-between gap-4 py-4">
							<span
								><strong>{item.product.name}</strong><small class="block text-base-content/75"
									>Quantity {item.quantity} · {data.context.isMock
										? 'Test price '
										: ''}{formatMoney(item.unitPrice)}</small
								></span
							>
							<strong class="font-mono"
								>{formatMoney({
									...item.unitPrice,
									amountMinor: item.unitPrice.amountMinor * item.quantity
								})}</strong
							>
						</li>
					{/each}
				</ul>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="rounded-2xl border border-base-300 p-5">
					<h2 class="font-display font-bold uppercase">Contact</h2>
					<p class="mt-2 text-sm text-base-content/70">{data.review.contactLabel}</p>
				</div>
				<div class="rounded-2xl border border-base-300 p-5">
					<h2 class="font-display font-bold uppercase">Shipping</h2>
					<p class="mt-2 text-sm text-base-content/70">{data.review.shippingLabel}</p>
				</div>
			</div>
		</section>

		<aside class="h-fit rounded-2xl border border-base-300 p-6 lg:sticky lg:top-24">
			{#if data.context.isMock}<MockCommerceNotice compact label="All totals are test data" />{/if}
			<dl class="mt-4 space-y-3">
				<div class="flex justify-between">
					<dt>Subtotal</dt>
					<dd class="font-mono">{formatMoney(data.review.subtotal)}</dd>
				</div>
				<div class="flex justify-between">
					<dt>Tax</dt>
					<dd class="font-mono">{formatMoney(data.review.tax)}</dd>
				</div>
				<div class="flex justify-between">
					<dt>Shipping</dt>
					<dd class="font-mono">{formatMoney(data.review.shipping)}</dd>
				</div>
				<div class="flex justify-between border-t border-base-300 pt-3 text-lg font-bold">
					<dt>Total</dt>
					<dd class="font-mono">{formatMoney(data.review.total)}</dd>
				</div>
			</dl>
			<form method="POST" action="?/submit" class="mt-6">
				<input type="hidden" name="idempotencyKey" value={data.review.idempotencyKey} />
				<button class="btn w-full btn-primary" type="submit" disabled={!data.review.canSubmit}>
					{data.context.isMock
						? 'Simulate test order'
						: data.review.canSubmit
							? 'Continue to secure payment'
							: 'Secure checkout unavailable'}
				</button>
			</form>
			{#if data.review.unavailableReason}
				<p class="mt-3 text-center text-sm text-base-content/70" role="status">
					{data.review.unavailableReason}
				</p>
			{/if}
			{#if data.context.isMock}<p class="mt-3 text-center text-xs text-base-content/75">
					No card, charge, email, fulfillment, or real order.
				</p>{/if}
		</aside>
	</div>
</main>
