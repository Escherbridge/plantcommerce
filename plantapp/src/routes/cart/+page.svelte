<script lang="ts">
	// Aevani cart — cream/forest glass to match the shop + product pages.
	// Renders the SSR-loaded cart first (no empty flash), then hydrates from the
	// shared `cart` store so the header count stays in lockstep after edits.
	import { onMount } from 'svelte';
	import { cart } from '$lib/stores/cart';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const FALLBACK_IMAGE = '/assets/plantproduct-seed.png';
	const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

	let hydrated = $state(false);
	let checkoutState = $state<'idle' | 'loading' | 'unavailable' | 'error'>('idle');
	let checkoutMessage = $state('');

	onMount(async () => {
		await cart.refresh();
		hydrated = true;
	});

	// Before the client store has synced, drive the UI from the server-loaded cart.
	const source = $derived(hydrated ? $cart : data.cart);
	const rawItems = $derived(source?.items ?? []);
	const totalAmount = $derived(source?.totalAmount ?? 0);
	const totalItems = $derived(source?.totalItems ?? 0);
	const busy = $derived(hydrated ? $cart.loading : false);
	const isEmpty = $derived(rawItems.length === 0);

	type CartLine = {
		id: number;
		productId: number;
		quantity: number;
		unitPrice: number;
		name: string;
		href: string;
		image: string;
		imageAlt: string;
		lineSubtotal: number;
	};

	const lines = $derived<CartLine[]>(
		rawItems.map((item) => {
			const product = item.product;
			const slug = product?.slug ?? '';
			const categorySlug = product?.categorySlug ?? null;
			const name = product?.name ?? 'Product';
			const unitPrice = Number.parseFloat(item.unitPrice) || 0;
			const image = product?.images?.[0]?.url ?? FALLBACK_IMAGE;
			return {
				id: item.id,
				productId: item.productId,
				quantity: item.quantity,
				unitPrice,
				name,
				href: slug ? `/products/${categorySlug ?? 'catalog'}/${slug}` : '/products',
				image,
				imageAlt: product?.images?.[0]?.altText ?? name,
				lineSubtotal: unitPrice * item.quantity
			};
		})
	);

	function increment(line: CartLine) {
		cart.updateItemQuantity(line.id, line.quantity + 1);
	}

	function decrement(line: CartLine) {
		if (line.quantity <= 1) return;
		cart.updateItemQuantity(line.id, line.quantity - 1);
	}

	function remove(line: CartLine) {
		cart.removeItem(line.id);
	}

	async function proceedToCheckout() {
		checkoutState = 'loading';
		checkoutMessage = '';
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				credentials: 'include'
			});

			if (res.ok) {
				const body = await res.json().catch(() => null);
				if (body?.url) {
					window.location.href = body.url;
					return;
				}
				checkoutState = 'error';
				checkoutMessage = 'Checkout could not be started. Please try again.';
				return;
			}

			// SvelteKit `error()` responses carry a JSON `{ message }`. 503 = checkout
			// disabled (Stripe placeholders / SECURE_CHECKOUT_ENABLED=false) — that is a
			// friendly "unavailable" state here, never a crash.
			let message = 'Checkout is temporarily unavailable.';
			const body = await res.json().catch(() => null);
			if (body && typeof body.message === 'string') message = body.message;
			checkoutState = res.status === 503 ? 'unavailable' : 'error';
			checkoutMessage = message;
		} catch {
			checkoutState = 'error';
			checkoutMessage = 'Checkout is temporarily unavailable. Please try again shortly.';
		}
	}
</script>

<svelte:head>
	<title>Your cart — Aevani</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="cart">
	<header class="cart-head">
		<span class="eyebrow">Your order</span>
		<h1 class="cart-title">Your cart</h1>
		{#if !isEmpty}
			<p class="cart-lead">
				{totalItems}
				{totalItems === 1 ? 'item' : 'items'} ready when you are. Review the details below, then head to
				checkout.
			</p>
		{/if}
	</header>

	{#if isEmpty}
		<section class="empty" aria-label="Empty cart">
			<div class="empty-card">
				<h2 class="empty-title">Your cart is empty</h2>
				<p class="empty-lead">
					Nothing here yet. Browse the catalogue — every tool was field-tested on our own beds before
					it earned its place.
				</p>
				<a href="/products" class="btn-primary">Explore the catalogue</a>
			</div>
		</section>
	{:else}
		<div class="cart-grid">
			<section class="lines" aria-label="Cart items">
				{#each lines as line (line.id)}
					<article class="line" data-cart-item data-cart-line-id={line.id}>
						<a class="line-thumb" href={line.href} aria-label={line.name}>
							<img src={line.image} alt={line.imageAlt} loading="lazy" />
						</a>

						<div class="line-body">
							<a class="line-name" href={line.href}>{line.name}</a>
							<span class="line-unit">{money.format(line.unitPrice)} each</span>

							<div class="line-controls">
								<div class="stepper" role="group" aria-label={`Quantity for ${line.name}`}>
									<button
										type="button"
										class="step"
										onclick={() => decrement(line)}
										disabled={busy || line.quantity <= 1}
										aria-label="Decrease quantity"
									>
										&minus;
									</button>
									<span class="step-count" aria-live="polite" data-cart-qty>{line.quantity}</span>
									<button
										type="button"
										class="step"
										onclick={() => increment(line)}
										disabled={busy}
										aria-label="Increase quantity"
									>
										+
									</button>
								</div>

								<button
									type="button"
									class="remove"
									onclick={() => remove(line)}
									disabled={busy}
								>
									Remove
								</button>
							</div>
						</div>

						<div class="line-subtotal">{money.format(line.lineSubtotal)}</div>
					</article>
				{/each}

				<a class="continue" href="/products">&larr; Continue shopping</a>
			</section>

			<aside class="summary" aria-label="Order summary">
				<div class="summary-card">
					<h2 class="summary-title">Order summary</h2>

					<dl class="summary-rows">
						<div class="summary-row">
							<dt>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</dt>
							<dd>{money.format(totalAmount)}</dd>
						</div>
						<div class="summary-row">
							<dt>Shipping</dt>
							<dd class="muted">Calculated at checkout</dd>
						</div>
					</dl>

					<div class="summary-total">
						<span>Total</span>
						<span>{money.format(totalAmount)}</span>
					</div>

					<button
						type="button"
						class="btn-primary checkout"
						onclick={proceedToCheckout}
						disabled={busy || checkoutState === 'loading'}
					>
						{checkoutState === 'loading' ? 'Starting checkout…' : 'Proceed to checkout'}
					</button>

					{#if checkoutState === 'unavailable'}
						<p class="checkout-note checkout-note--warn" role="status">
							{checkoutMessage}
						</p>
					{:else if checkoutState === 'error'}
						<p class="checkout-note checkout-note--error" role="alert">
							{checkoutMessage}
						</p>
					{:else}
						<p class="checkout-note">
							Taxes and shipping are confirmed at checkout. Secure payment by card.
						</p>
					{/if}
				</div>
			</aside>
		</div>
	{/if}
</main>

<style>
	.cart {
		max-width: 1180px;
		margin: 0 auto;
		padding: 56px 24px 96px;
	}

	.eyebrow {
		display: block;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #2e6b4f;
	}

	.cart-title {
		margin: 14px 0 0;
		font-family: var(--font-display);
		font-size: 48px;
		font-weight: 600;
		line-height: 1.05;
		letter-spacing: -0.02em;
		color: #1c3527;
	}

	.cart-lead {
		margin: 14px 0 0;
		font-family: var(--font-body);
		font-size: 18px;
		line-height: 1.6;
		color: #4a5f52;
	}

	/* ---- Layout ---- */
	.cart-grid {
		margin-top: 40px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 360px;
		gap: 28px;
		align-items: start;
	}

	/* ---- Line items ---- */
	.lines {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.line {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr) auto;
		gap: 18px;
		align-items: center;
		padding: 16px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(46, 107, 79, 0.22);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 6px 20px rgba(30, 74, 54, 0.06);
	}

	.line-thumb {
		display: block;
		width: 96px;
		height: 96px;
		border-radius: 14px;
		overflow: hidden;
		background: rgba(46, 107, 79, 0.06);
		border: 1px solid rgba(46, 107, 79, 0.14);
	}

	.line-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.line-body {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.line-name {
		font-family: var(--font-display);
		font-size: 19px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #1c3527;
		text-decoration: none;
		line-height: 1.2;
	}

	.line-name:hover {
		color: #2e6b4f;
	}

	.line-unit {
		font-family: var(--font-body);
		font-size: 14px;
		color: #5a7263;
	}

	.line-controls {
		margin-top: 4px;
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}

	.stepper {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(46, 107, 79, 0.28);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
		overflow: hidden;
	}

	.step {
		appearance: none;
		cursor: pointer;
		width: 34px;
		height: 34px;
		border: 0;
		background: transparent;
		color: #22362a;
		font-size: 17px;
		line-height: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background-color 160ms ease;
	}

	.step:hover:not(:disabled) {
		background: rgba(46, 107, 79, 0.1);
	}

	.step:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.step-count {
		min-width: 34px;
		text-align: center;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		color: #1c3527;
	}

	.remove {
		appearance: none;
		cursor: pointer;
		border: 0;
		background: transparent;
		padding: 0;
		font-family: var(--font-body);
		font-size: 13.5px;
		font-weight: 600;
		color: #8a5a4a;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.remove:hover:not(:disabled) {
		color: #6d3f31;
	}

	.remove:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.line-subtotal {
		align-self: start;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 600;
		color: #1c3527;
		white-space: nowrap;
	}

	.continue {
		margin-top: 8px;
		font-family: var(--font-body);
		font-size: 14.5px;
		font-weight: 600;
		color: #2e6b4f;
		text-decoration: none;
	}

	.continue:hover {
		color: #1e4a36;
	}

	/* ---- Summary ---- */
	.summary {
		position: sticky;
		top: 24px;
	}

	.summary-card {
		padding: 24px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(46, 107, 79, 0.24);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 12px 32px rgba(30, 74, 54, 0.1);
	}

	.summary-title {
		margin: 0 0 18px;
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #1c3527;
	}

	.summary-rows {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.summary-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		font-family: var(--font-body);
		font-size: 15px;
		color: #3f5548;
	}

	.summary-row dt {
		margin: 0;
	}

	.summary-row dd {
		margin: 0;
		font-weight: 600;
		color: #1c3527;
	}

	.summary-row dd.muted {
		font-weight: 500;
		color: #5a7263;
	}

	.summary-total {
		margin-top: 18px;
		padding-top: 18px;
		border-top: 1px solid rgba(46, 107, 79, 0.16);
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 600;
		color: #1c3527;
	}

	.checkout {
		margin-top: 22px;
		width: 100%;
	}

	.checkout-note {
		margin: 14px 0 0;
		font-family: var(--font-body);
		font-size: 13px;
		line-height: 1.5;
		color: #5a7263;
	}

	.checkout-note--warn {
		color: #7a5a2e;
	}

	.checkout-note--error {
		color: #8a4a3f;
	}

	/* ---- Shared primary button ---- */
	.btn-primary {
		appearance: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 13px 26px;
		border: 1px solid transparent;
		border-radius: 999px;
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 600;
		letter-spacing: 0.01em;
		text-decoration: none;
		color: #f4f1ea;
		background: linear-gradient(180deg, #347a56, #1e4a36);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			0 8px 22px rgba(30, 74, 54, 0.28);
		transition:
			transform 180ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			box-shadow 180ms ease,
			opacity 180ms ease;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.btn-primary:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	/* ---- Empty state ---- */
	.empty {
		margin-top: 40px;
		display: flex;
		justify-content: center;
	}

	.empty-card {
		max-width: 520px;
		width: 100%;
		text-align: center;
		padding: 48px 32px;
		border-radius: 22px;
		background: rgba(255, 255, 255, 0.62);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(46, 107, 79, 0.22);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 10px 28px rgba(30, 74, 54, 0.08);
	}

	.empty-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: #1c3527;
	}

	.empty-lead {
		margin: 14px 0 26px;
		font-family: var(--font-body);
		font-size: 16.5px;
		line-height: 1.6;
		color: #4a5f52;
	}

	/* ---- Responsive ---- */
	@media (max-width: 900px) {
		.cart-grid {
			grid-template-columns: 1fr;
		}
		.summary {
			position: static;
		}
	}

	@media (max-width: 520px) {
		.cart {
			padding: 40px 18px 72px;
		}
		.cart-title {
			font-size: 36px;
		}
		.line {
			grid-template-columns: 72px minmax(0, 1fr);
			grid-template-areas:
				'thumb body'
				'subtotal subtotal';
		}
		.line-thumb {
			grid-area: thumb;
			width: 72px;
			height: 72px;
		}
		.line-body {
			grid-area: body;
		}
		.line-subtotal {
			grid-area: subtotal;
			justify-self: end;
		}
	}
</style>
