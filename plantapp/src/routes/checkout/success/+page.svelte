<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let retryCount = $state(0);
	const maxRetries = 10;

	// Auto-refresh if order is still processing (webhook hasn't fired yet)
	$effect(() => {
		if (data.status === 'processing' && retryCount < maxRetries) {
			const timer = setTimeout(() => {
				retryCount++;
				// Reload the page to check again
				window.location.reload();
			}, 3000);

			return () => clearTimeout(timer);
		}
	});
</script>

<svelte:head>
	<title
		>Order {data.status === 'complete'
			? 'Confirmed'
			: data.status === 'access_required'
				? 'Details Protected'
				: 'Processing'} | Aevani</title
	>
</svelte:head>

<div class="success-page">
	{#if data.status === 'complete' && data.order}
		<div class="success-container">
			<div class="success-icon">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
			</div>

			<h1>Order Confirmed</h1>
			<p class="order-number">Order #{data.order.orderNumber}</p>
			<p class="confirmation-text">
				Thank you for your purchase! A confirmation email has been sent to <strong
					>{data.order.customerEmail}</strong
				>.
			</p>

			<!-- Order Summary -->
			<div class="order-summary">
				<h2>Order Summary</h2>

				<div class="items-list">
					{#each data.order.items as item}
						<div class="order-item">
							<div class="item-info">
								<span class="item-name">{item.productName}</span>
								<span class="item-qty">x{item.quantity}</span>
							</div>
							<span class="item-price">${parseFloat(item.totalPrice).toFixed(2)}</span>
						</div>
					{/each}
				</div>

				<div class="totals">
					<div class="total-row">
						<span>Subtotal</span>
						<span>${parseFloat(data.order.subtotalAmount).toFixed(2)}</span>
					</div>
					<div class="total-row">
						<span>Tax</span>
						<span>${parseFloat(data.order.taxAmount).toFixed(2)}</span>
					</div>
					<div class="total-row">
						<span>Shipping</span>
						<span>${parseFloat(data.order.shippingAmount).toFixed(2)}</span>
					</div>
					{#if parseFloat(data.order.discountAmount) > 0}
						<div class="total-row discount">
							<span>Discount</span>
							<span>-${parseFloat(data.order.discountAmount).toFixed(2)}</span>
						</div>
					{/if}
					<div class="total-row total">
						<span>Total</span>
						<span>${parseFloat(data.order.totalAmount).toFixed(2)}</span>
					</div>
				</div>
			</div>

			<div class="actions">
				<a href="/products" class="btn-continue">Continue Shopping</a>
				<a href="/account/orders" class="btn-orders">View Orders</a>
			</div>
		</div>
	{:else if data.status === 'access_required'}
		<div class="success-container processing">
			<h1>Order Details Protected</h1>
			<p class="confirmation-text">
				We can’t display order details in this browser. If you made a payment, wait for an
				order-confirmation email before treating it as complete.
			</p>
			<a href="/products" class="btn-continue">Continue Shopping</a>
		</div>
	{:else if data.status === 'processing'}
		<div class="success-container processing">
			<div class="processing-icon">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
			</div>
			<h1>Processing Your Order</h1>
			<p class="confirmation-text">
				We are confirming your checkout. Please do not submit another payment while this page
				updates.
			</p>
			<div class="spinner"></div>
			{#if retryCount >= maxRetries}
				<p class="retry-message">
					This is taking longer than expected. Wait for an order-confirmation email before
					considering the order complete.
				</p>
				<a href="/products" class="btn-continue">Continue Shopping</a>
			{/if}
		</div>
	{:else}
		<div class="success-container error">
			<h1>Something went wrong</h1>
			<p class="confirmation-text">
				We couldn't find your order. If you completed a payment, don't worry — your order will still
				be processed.
			</p>
			<a href="/products" class="btn-continue">Continue Shopping</a>
		</div>
	{/if}
</div>

<style>
	.success-page {
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.success-container {
		max-width: 600px;
		width: 100%;
		text-align: center;
	}

	.success-icon svg,
	.processing-icon svg {
		width: 4rem;
		height: 4rem;
		margin-bottom: 1.5rem;
	}

	.success-icon svg {
		color: oklch(var(--su));
	}

	.processing-icon svg {
		color: oklch(var(--wa));
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	h1 {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: oklch(var(--bc));
		margin-bottom: 0.5rem;
	}

	.order-number {
		font-family: var(--font-mono, monospace);
		font-size: 1rem;
		color: oklch(var(--bc) / 0.6);
		margin-bottom: 1rem;
	}

	.confirmation-text {
		font-size: 1rem;
		color: oklch(var(--bc) / 0.7);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.order-summary {
		text-align: left;
		background: oklch(var(--b2));
		border-radius: var(--input-radius, 10px);
		padding: 1.5rem;
		margin-bottom: 2rem;
		border: 1px solid oklch(var(--bc) / 0.1);
	}

	.order-summary h2 {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
		margin-bottom: 1rem;
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid oklch(var(--bc) / 0.1);
	}

	.order-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-info {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.item-name {
		font-size: 0.9375rem;
		color: oklch(var(--bc));
	}

	.item-qty {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.5);
	}

	.item-price {
		font-family: var(--font-mono, monospace);
		font-size: 0.9375rem;
		color: oklch(var(--bc));
	}

	.totals {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.9375rem;
		color: oklch(var(--bc) / 0.7);
	}

	.total-row.discount {
		color: oklch(var(--su));
	}

	.total-row.total {
		font-weight: 700;
		font-size: 1.125rem;
		color: oklch(var(--bc));
		padding-top: 0.5rem;
		border-top: 1px solid oklch(var(--bc) / 0.1);
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn-continue,
	.btn-orders {
		display: inline-flex;
		align-items: center;
		padding: 0.75rem 1.5rem;
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		text-decoration: none;
		transition: opacity 150ms ease;
	}

	.btn-continue {
		background: oklch(var(--p));
		color: oklch(var(--pc));
	}

	.btn-orders {
		background: oklch(var(--b2));
		color: oklch(var(--bc));
		border: 1.5px solid oklch(var(--bc) / 0.15);
	}

	.btn-continue:hover,
	.btn-orders:hover {
		opacity: 0.9;
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid oklch(var(--bc) / 0.1);
		border-top-color: oklch(var(--p));
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 1rem auto;
	}

	.retry-message {
		font-size: 0.875rem;
		color: oklch(var(--wa));
		margin-bottom: 1.5rem;
	}
</style>
