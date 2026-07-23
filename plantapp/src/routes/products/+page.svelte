<script lang="ts">
	// Aevani Shop / catalogue. Header + category chips (client filter, ?category= in URL)
	// + featured hero row + 4-col product grid. See design-spec.md §6.
	import { ProductCard } from '$lib/components/cards';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Chip id -> label. Chip -> product system mapping lives in chipMatches().
	const CHIPS = [
		{ id: 'all', label: 'All products' },
		{ id: 'hydroponics', label: 'Hydroponics' },
		{ id: 'aquaponics', label: 'Aquaponics' },
		{ id: 'silvopasture', label: 'Silvopasture' },
		{ id: 'agroforestry', label: 'Agroforestry' },
		{ id: 'kits-collections', label: 'Starter kits' },
		{ id: 'seeds-supplies', label: 'Seeds & supplies' }
	];

	const FEATURED_BADGE: Record<string, string> = {
		'vertical-tower-garden-system': 'Bestseller',
		'ibc-aquaponics-fish-tank': 'In stock',
		'permaculture-starter-kit': 'Great first kit'
	};

	let selected = $state(data.selectedCategory ?? 'all');
	const searchQuery = $derived((data.searchQuery ?? '').trim());

	/** True when a product's system belongs to the given chip. */
	function chipMatches(chipId: string, system: string): boolean {
		if (chipId === 'all') return true;
		if (chipId === 'seeds-supplies') return system === 'plants-seeds' || system === 'garden-tools';
		return system === chipId;
	}

	const filtered = $derived(
		data.products.filter((p) => {
			if (!chipMatches(selected, p.system)) return false;
			if (searchQuery) {
				const hay = `${p.name} ${p.shortDescription ?? ''} ${p.categoryName}`.toLowerCase();
				if (!hay.includes(searchQuery.toLowerCase())) return false;
			}
			return true;
		})
	);

	const activeLabel = $derived(CHIPS.find((c) => c.id === selected)?.label ?? 'All products');

	function badgeFor(p: PageData['products'][number]): string | undefined {
		if (p.badges && p.badges.length > 0) return p.badges[0];
		if (p.comparePrice) return 'Sale';
		if (p.isFeatured) return 'Bestseller';
		return undefined;
	}

	function selectChip(id: string) {
		selected = id;
		const params = new URLSearchParams();
		if (id !== 'all') params.set('category', id);
		if (searchQuery) params.set('search', searchQuery);
		const qs = params.toString();
		replaceState(qs ? `${page.url.pathname}?${qs}` : page.url.pathname, page.state);
	}
</script>

<svelte:head>
	<title>Shop the catalogue — Aevani</title>
	<meta
		name="description"
		content="Every tool here earned its place. Field-tested hydroponics, aquaponics, silvopasture, agroforestry systems, starter kits, seeds and supplies — only what we've grown with."
	/>
</svelte:head>

<main class="catalogue">
	<header class="cat-head">
		<span class="eyebrow">The catalogue</span>
		<h1 class="cat-title">Every tool here earned its place.</h1>
		<p class="cat-lead">
			We only sell what we've grown with. Every system, kit, seed, and hand tool below was
			field-tested on our own beds before it made the cut — no drop-shipped filler, no listings we
			couldn't stand behind.
		</p>
	</header>

	<!-- Category filter chips -->
	<nav class="chips" aria-label="Filter by category">
		{#each CHIPS as chip}
			<button
				type="button"
				class="chip"
				class:chip--active={selected === chip.id}
				aria-pressed={selected === chip.id}
				onclick={() => selectChip(chip.id)}
			>
				{chip.label}
			</button>
		{/each}
	</nav>

	<!-- Featured hero row -->
	{#if data.featured.length > 0 && selected === 'all' && !searchQuery}
		<section class="featured" aria-label="Featured products">
			{#each data.featured as product}
				<ProductCard
					variant="featured"
					href={product.href}
					image={product.image}
					imageAlt={product.imageAlt}
					title={product.name}
					category={product.categoryName}
					price={product.price}
					badge={FEATURED_BADGE[product.slug]}
				/>
			{/each}
		</section>
	{/if}

	<!-- Product grid -->
	<section class="grid-section" aria-label="Products">
		<div class="grid-head">
			<h2 class="grid-title">
				{activeLabel} · {filtered.length}
				{filtered.length === 1 ? 'item' : 'items'}
			</h2>
			<span class="grid-sort">Sorted by our honest recommendation</span>
		</div>

		{#if filtered.length > 0}
			<div class="product-grid">
				{#each filtered as product}
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
					{#if data.products.length === 0}
						The catalogue is being restocked. Check back shortly or reach out and we'll help.
					{:else}
						Nothing in <strong>{activeLabel}</strong>{searchQuery
							? ` matching “${searchQuery}”`
							: ''} just yet.
					{/if}
				</p>
				{#if data.products.length > 0}
					<button type="button" class="chip chip--active" onclick={() => selectChip('all')}>
						View all products
					</button>
				{/if}
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

	/* ---- Chips ---- */
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 36px;
	}

	.chip {
		appearance: none;
		cursor: pointer;
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

	/* ---- Featured row ---- */
	.featured {
		margin-top: 40px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 22px;
	}

	/* ---- Grid section ---- */
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

	/* ---- Empty state ---- */
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

	/* ---- Responsive ---- */
	@media (max-width: 1024px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
		}
		.featured {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 820px) {
		.product-grid,
		.featured {
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
		.product-grid,
		.featured {
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
