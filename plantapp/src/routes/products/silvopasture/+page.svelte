<script lang="ts">
	// Silvopasture landing page — same catalogue look, filtered to the system.
	// System H1 + lead, chip nav (active = this system), 4-col product grid. Design-spec §6.
	import { ProductCard } from '$lib/components/cards';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const SYSTEM = 'silvopasture';
	const TITLE = 'Silvopasture';
	const LEAD =
		"Trees, forage, and livestock sharing the same acre. Seed mixes, rotational netting, shaded troughs, and tree protection we've put to pasture ourselves.";

	const CHIPS = [
		{ id: 'all', label: 'All products', href: '/products' },
		{ id: 'hydroponics', label: 'Hydroponics', href: '/products/hydroponics' },
		{ id: 'aquaponics', label: 'Aquaponics', href: '/products/aquaponics' },
		{ id: 'silvopasture', label: 'Silvopasture', href: '/products/silvopasture' },
		{ id: 'agroforestry', label: 'Agroforestry', href: '/products/agroforestry' },
		{ id: 'kits-collections', label: 'Starter kits', href: '/products?category=kits-collections' },
		{ id: 'seeds-supplies', label: 'Seeds & supplies', href: '/products?category=seeds-supplies' }
	];

	function badgeFor(p: PageData['products'][number]): string | undefined {
		if (p.badges && p.badges.length > 0) return p.badges[0];
		if (p.comparePrice) return 'Sale';
		if (p.isFeatured) return 'Bestseller';
		return undefined;
	}
</script>

<svelte:head>
	<title>{TITLE} — Aevani</title>
	<meta name="description" content={LEAD} />
</svelte:head>

<main class="catalogue">
	<header class="cat-head">
		<span class="eyebrow">Growing systems</span>
		<h1 class="cat-title">{TITLE}</h1>
		<p class="cat-lead">{LEAD}</p>
	</header>

	<nav class="chips" aria-label="Browse categories">
		{#each CHIPS as chip}
			<a href={chip.href} class="chip" class:chip--active={chip.id === SYSTEM}>{chip.label}</a>
		{/each}
	</nav>

	<section class="grid-section" aria-label="Products">
		<div class="grid-head">
			<h2 class="grid-title">
				{TITLE} · {data.products.length}
				{data.products.length === 1 ? 'item' : 'items'}
			</h2>
			<span class="grid-sort">Sorted by our honest recommendation</span>
		</div>

		{#if data.products.length > 0}
			<div class="product-grid">
				{#each data.products as product}
					<ProductCard
						href={product.href}
						image={product.image}
						imageAlt={product.imageAlt}
						title={product.name}
						category={product.categoryName}
						description={product.shortDescription ?? undefined}
						price={product.price}
						compareAt={product.comparePrice ?? undefined}
						badge={badgeFor(product)}
					/>
				{/each}
			</div>
		{:else}
			<div class="empty">
				<p class="empty-lead">
					We're restocking {TITLE.toLowerCase()} right now. Browse the full catalogue in the meantime.
				</p>
				<a href="/products" class="chip chip--active">View all products</a>
			</div>
		{/if}
	</section>
</main>

<style>
	.catalogue {
		max-width: 1240px;
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

	.cat-head {
		max-width: 720px;
	}

	.cat-title {
		margin: 14px 0 0;
		font-family: var(--font-display);
		font-size: 52px;
		font-weight: 600;
		line-height: 1.04;
		letter-spacing: -0.02em;
		color: #1c3527;
		text-wrap: balance;
	}

	.cat-lead {
		margin: 18px 0 0;
		font-family: var(--font-body);
		font-size: 19px;
		line-height: 1.6;
		color: #4a5f52;
		text-wrap: pretty;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 36px;
	}

	.chip {
		display: inline-block;
		text-decoration: none;
		padding: 11px 20px;
		border-radius: 999px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 600;
		color: #22362a;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(46, 107, 79, 0.28);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
		transition:
			transform 200ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			background-color 200ms ease,
			color 200ms ease,
			box-shadow 200ms ease;
	}

	.chip:hover {
		transform: translateY(-1px);
		border-color: rgba(46, 107, 79, 0.45);
	}

	.chip--active {
		color: #f4f1ea;
		background: linear-gradient(180deg, #347a56, #1e4a36);
		border-color: transparent;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.35),
			0 6px 18px rgba(30, 74, 54, 0.32);
	}

	.grid-section {
		margin-top: 56px;
	}

	.grid-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding-bottom: 20px;
		border-bottom: 1px solid rgba(46, 107, 79, 0.14);
	}

	.grid-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: #1c3527;
	}

	.grid-sort {
		font-family: var(--font-body);
		font-size: 13.5px;
		color: #5a7263;
	}

	.product-grid {
		margin-top: 28px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 22px;
	}

	.empty {
		margin-top: 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 64px 24px;
		text-align: center;
	}

	.empty-lead {
		margin: 0;
		max-width: 520px;
		font-family: var(--font-body);
		font-size: 18px;
		line-height: 1.6;
		color: #4a5f52;
	}

	@media (max-width: 1024px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 820px) {
		.product-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.cat-title {
			font-size: 40px;
		}
	}

	@media (max-width: 520px) {
		.catalogue {
			padding: 40px 18px 72px;
		}
		.product-grid {
			grid-template-columns: 1fr;
		}
		.cat-title {
			font-size: 34px;
		}
		.cat-lead {
			font-size: 17px;
		}
	}
</style>
