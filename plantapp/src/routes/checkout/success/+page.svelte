<script lang="ts">
	import { formatMoney } from '$lib/commerce/contracts';
	import { MockCommerceNotice } from '$lib/components/commerce';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	$effect(() => {
		if (data.status === 'processing' && data.pollAttempt < 10) {
			const timer = setTimeout(() => {
				const nextUrl = new URL(window.location.href);
				nextUrl.searchParams.set('poll', String(data.pollAttempt + 1));
				window.location.replace(nextUrl);
			}, 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

<svelte:head>
	<title>{data.context.isMock ? 'Test order result' : 'Order result'} | Aevani</title>
	{#if data.context.isMock}<meta name="robots" content="noindex,nofollow" />{/if}
</svelte:head>

{#if data.context.isMock}<MockCommerceNotice label={data.context.label} />{/if}

<main class="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
	{#if data.status === 'complete' && data.demoOrder}
		<section class="rounded-3xl border border-base-300 p-6 sm:p-10">
			<MockCommerceNotice compact label="Mock/test order success" />
			<p class="mt-6 font-mono text-xs font-bold tracking-[0.18em] uppercase">
				Simulation complete
			</p>
			<h1 class="font-display mt-2 text-4xl font-bold uppercase sm:text-6xl">
				Test order simulated
			</h1>
			<p class="mt-4 text-lg leading-relaxed text-base-content/75">
				No payment was taken. No email was sent. No inventory, fulfillment, production database,
				account, or real order was created.
			</p>
			<p class="mt-6 font-mono font-bold">{data.demoOrder.reference}</p>
			<div class="mt-8 divide-y divide-base-300 border-y border-base-300">
				{#each data.demoOrder.items as item}
					<div class="flex justify-between gap-4 py-4">
						<span
							>{item.product.name} × {item.quantity}<small class="block text-base-content/75"
								>Test price</small
							></span
						>
						<strong class="font-mono"
							>{formatMoney({
								...item.unitPrice,
								amountMinor: item.unitPrice.amountMinor * item.quantity
							})}</strong
						>
					</div>
				{/each}
			</div>
			<dl class="mt-6 space-y-2">
				<div class="flex justify-between">
					<dt>Test subtotal</dt>
					<dd>{formatMoney(data.demoOrder.subtotal)}</dd>
				</div>
				<div class="flex justify-between">
					<dt>Test tax</dt>
					<dd>{formatMoney(data.demoOrder.tax)}</dd>
				</div>
				<div class="flex justify-between">
					<dt>Test shipping</dt>
					<dd>{formatMoney(data.demoOrder.shipping)}</dd>
				</div>
				<div class="flex justify-between border-t border-base-300 pt-3 text-lg font-bold">
					<dt>Test total</dt>
					<dd class="font-mono">{formatMoney(data.demoOrder.total)}</dd>
				</div>
			</dl>
			<a class="btn mt-8 btn-primary" href="/products">Continue testing catalogue</a>
		</section>
	{:else if data.status === 'complete' && data.databaseOrder}
		<section class="rounded-3xl border border-base-300 p-6 text-center sm:p-10">
			<h1 class="font-display text-4xl font-bold uppercase sm:text-6xl">Order confirmed</h1>
			<p class="mt-4 font-mono font-bold">{data.databaseOrder.orderNumber}</p>
			<p class="mt-4 text-base-content/70">
				Your payment was confirmed and the order record is available below. Keep this reference for
				support.
			</p>
			<a class="btn mt-8 btn-primary" href="/account/orders/{data.databaseOrder.orderNumber}"
				>View order</a
			>
		</section>
	{:else if data.status === 'processing'}
		<section class="rounded-3xl border border-base-300 p-10 text-center">
			<h1 class="font-display text-4xl font-bold uppercase">
				{data.pollAttempt < 10 ? 'Confirming payment' : 'Confirmation is taking longer'}
			</h1>
			<p class="mt-4 text-base-content/70">
				{data.pollAttempt < 10
					? 'Please do not submit another payment while the secure confirmation completes.'
					: 'Do not submit another payment. Refresh this page later or contact support with your checkout reference.'}
			</p>
			{#if data.pollAttempt >= 10}
				<div class="mt-6 flex flex-wrap justify-center gap-3">
					<button
						class="btn btn-primary"
						type="button"
						onclick={() => {
							const nextUrl = new URL(window.location.href);
							nextUrl.searchParams.delete('poll');
							window.location.assign(nextUrl);
						}}
					>
						Check again
					</button>
					<a class="btn" href="/contact">Contact support</a>
				</div>
			{/if}
		</section>
	{:else}
		<section class="rounded-3xl border border-base-300 p-10 text-center">
			<h1 class="font-display text-4xl font-bold uppercase">Order details protected</h1>
			<p class="mt-4 text-base-content/70">
				This browser does not have access to that order result.
			</p>
			<a class="btn mt-6" href="/products">Return to catalogue</a>
		</section>
	{/if}
</main>
