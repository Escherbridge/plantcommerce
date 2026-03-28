<script lang="ts">
	interface Props {
		image: string;
		imageAlt: string;
		title: string;
		price: number;
		href: string;
		badge?: string;
		class?: string;
	}

	let {
		image,
		imageAlt,
		title,
		price,
		href,
		badge,
		class: className = ''
	}: Props = $props();

	const formattedPrice = $derived(
		new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
	);
</script>

<style>
	.product-card {
		border-radius: var(--radius-lg, 0.75rem);
		box-shadow: var(--shadow-md);
		transition:
			box-shadow 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			border-color 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
		overflow: hidden;
	}

	.product-card:hover {
		box-shadow: var(--shadow-xl);
	}

	.product-card:hover .product-card__image {
		transform: scale(1.05);
	}

	.product-card:hover .product-card__overlay {
		opacity: 1;
	}

	.product-card:hover .product-card__cta {
		transform: translateY(0);
		opacity: 1;
	}

	.product-card__image-wrap {
		position: relative;
		overflow: hidden;
		border-radius: var(--radius-lg, 0.75rem) var(--radius-lg, 0.75rem) 0 0;
		aspect-ratio: 4 / 3;
	}

	.product-card__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 400ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.product-card__overlay {
		position: absolute;
		inset: 0;
		background-color: oklch(var(--p) / 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}

	.product-card__badge {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background-color: oklch(var(--a));
		color: oklch(var(--ac));
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm, 0.25rem);
	}

	.product-card__cta {
		font-family: var(--font-display, 'Barlow Condensed', sans-serif);
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(var(--b1));
		font-weight: 700;
		transform: translateY(8px);
		opacity: 0;
		transition:
			transform 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)),
			opacity 300ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1));
	}
</style>

<a
	{href}
	class="product-card block border border-base-300 bg-base-100 hover:border-primary/30 {className}"
>
	<div class="product-card__image-wrap">
		<img src={image} alt={imageAlt} class="product-card__image" loading="lazy" />
		<div class="product-card__overlay">
			<span class="product-card__cta">Quick View</span>
		</div>
		{#if badge}
			<span class="product-card__badge">{badge}</span>
		{/if}
	</div>

	<div class="p-4">
		<h3 class="font-sans text-lg font-semibold text-base-content line-clamp-2 mb-1">{title}</h3>
		<p class="font-mono text-xl font-bold text-primary">{formattedPrice}</p>
	</div>
</a>
