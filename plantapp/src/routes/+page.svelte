<script lang="ts">
	import StructuredData from '$lib/components/StructuredData.svelte';
	import { ProductCard, SystemCard } from '$lib/components/cards';
	import { SectionHeader, GlassCard, Button } from '$lib/components/ui';
	import { assetManifest } from '$lib/data/assetManifest';
	import { publicSite, publicSiteUrl } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Featured field kit + real catalogue count from the server load.
	const featuredProducts = $derived(data.featuredProducts ?? []);
	const productCount = $derived(data.productCount ?? 0);

	// Hero product stat: real catalogue count where available, else the brand default.
	const productStat = $derived(productCount > 0 ? `${productCount}+` : '38+');

	// Growing systems — four ways to grow, each linking to its catalogue slug.
	const systems = [
		{
			number: '01',
			title: 'Hydroponics',
			href: '/products/hydroponics',
			image: assetManifest.verticalTower,
			description:
				'Soil-free growing that fits more harvest into less space, using up to 90% less water than a conventional bed.'
		},
		{
			number: '02',
			title: 'Aquaponics',
			href: '/products/aquaponics',
			image: assetManifest.ibcFishTank,
			description:
				'Fish and plants in one closed loop — the fish feed the greens, the greens keep the water clean.'
		},
		{
			number: '03',
			title: 'Silvopasture',
			href: '/products/silvopasture',
			image: assetManifest.silvoSeedMix,
			description:
				'Trees, forage, and livestock sharing the same acre — shade, feed, and healthier soil, all at once.'
		},
		{
			number: '04',
			title: 'Agroforestry',
			href: '/products/agroforestry',
			image: assetManifest.nfixingTreeSeeds,
			description:
				'Perennial trees and shrubs layered into your land for food, fuel, and long-term resilience.'
		}
	];

	// Why Aevani — four value props (titles verbatim from the design).
	const values = [
		{
			title: 'Tested, not listed',
			body: 'Every product here earned its place in our own beds first. If it did not survive a real season of use, it never makes the catalogue.'
		},
		{
			title: 'Knowledge included',
			body: 'Gear is only half the story. Every kit ships with the growing guide we wish we had — and the Learn hub is free for everyone.'
		},
		{
			title: 'Built to be repaired',
			body: 'We stock the parts that wear out and show you how to swap them. A tower that lasts ten years beats one you replace every two.'
		},
		{
			title: 'Honest by default',
			body: 'We will tell you what a product cannot do as plainly as what it can. If a crop got top-heavy in our tests, it is in the notes.'
		}
	];

	/** Build the product detail href from a normalized featured product. */
	function productHref(p: any): string {
		const cat = p.categorySlug || p.category?.slug || 'all';
		return `/products/${cat}/${p.slug}`;
	}

	/** First real product image, falling back to the hero asset (never a placeholder). */
	function productImage(p: any): string {
		return p.images?.[0]?.url || assetManifest.heroMain;
	}

	/** Optional badge from the product's first tag (rendered uppercase by ProductCard). */
	function productBadge(p: any): string | undefined {
		return Array.isArray(p.tags) && p.tags.length > 0 ? String(p.tags[0]) : undefined;
	}
</script>

<svelte:head>
	<title>{publicSite.name} | Field-tested growing systems</title>
	<meta
		name="description"
		content="Field-tested hydroponic, aquaponic, silvopasture, and agroforestry systems — sold with the guides, spare parts, and honest notes you need to keep things alive."
	/>

	<StructuredData
		type="website"
		data={{
			name: publicSite.name,
			url: publicSite.origin,
			description: publicSite.description
		}}
	/>

	<StructuredData
		type="organization"
		data={{
			name: publicSite.name,
			url: publicSite.origin,
			logo: publicSiteUrl(assetManifest.heroMain)
		}}
	/>
</svelte:head>

<div class="home">
	<!-- 1. Hero -->
	<section class="home-hero container">
		<div class="hero__left">
			<span class="status-badge">
				<span class="status-badge__dot" aria-hidden="true"></span>
				Field-tested growing systems
			</span>

			<h1 class="hero__title">Grow something that outlasts the season.</h1>

			<p class="hero__lead">
				Field-tested hydroponic, aquaponic, and agroforestry systems — sold with the guides, the
				spare parts, and the honest notes you need to actually keep things alive.
			</p>

			<div class="hero__ctas">
				<Button href="/products" variant="primary" size="lg">Shop the catalogue</Button>
				<Button href="/learn" variant="secondary" size="lg">Start learning — it's free</Button>
			</div>

			<div class="hero__stats">
				<div class="hero-stat">
					<span class="hero-stat__value">{productStat}</span>
					<span class="hero-stat__label">field-tested products</span>
				</div>
				<div class="hero-stat">
					<span class="hero-stat__value">4</span>
					<span class="hero-stat__label">growing systems</span>
				</div>
				<div class="hero-stat">
					<span class="hero-stat__value">2-yr</span>
					<span class="hero-stat__label">warranty</span>
				</div>
			</div>
		</div>

		<div class="hero__right">
			<div class="hero-visual">
				<img
					class="hero-visual__img"
					src={assetManifest.heroMain}
					alt="Aevani vertical growing tower thriving with leafy greens and herbs"
					fetchpriority="high"
				/>
				<div class="float-card float-card--top">
					<span class="float-card__value">40+ plants</span>
					<span class="float-card__label">in 2 sq ft of floor space</span>
				</div>
				<div class="float-card float-card--bottom">
					<span class="float-card__value">&minus;90% water</span>
					<span class="float-card__label">vs. conventional beds</span>
				</div>
			</div>
		</div>
	</section>

	<!-- 2. Systems -->
	<section id="systems" class="section container">
		<SectionHeader
			eyebrow="Four ways to grow"
			title="Pick a system. We'll walk the rest of the way with you."
			actionLabel="Browse everything"
			actionHref="/products"
		/>
		<div class="systems-grid">
			{#each systems as system}
				<SystemCard
					number={system.number}
					title={system.title}
					href={system.href}
					image={system.image}
					description={system.description}
				/>
			{/each}
		</div>
	</section>

	<!-- 3. Why Aevani -->
	<section id="about" class="section container">
		<GlassCard padding="clamp(28px, 4vw, 56px)" radius={28}>
			<div class="why">
				<div class="why__intro">
					<span class="why__eyebrow">Why Aevani</span>
					<h2 class="why__title">We only sell what we've grown with.</h2>
				</div>
				<div class="why__grid">
					{#each values as value}
						<div class="value">
							<h3 class="value__title">{value.title}</h3>
							<p class="value__body">{value.body}</p>
						</div>
					{/each}
				</div>
			</div>
		</GlassCard>
	</section>

	<!-- 4. Featured products -->
	{#if featuredProducts.length > 0}
		<section class="section container">
			<SectionHeader
				eyebrow="Current field kit"
				title="What we're reaching for this season"
				actionLabel="Full catalogue"
				actionHref="/products"
			/>
			<div class="featured-grid">
				{#each featuredProducts as product}
					<ProductCard
						href={productHref(product)}
						image={productImage(product)}
						imageAlt={product.images?.[0]?.altText || product.name}
						title={product.name}
						category={product.category?.name ?? 'Aevani'}
						description={product.shortDescription}
						price={product.price}
						compareAt={product.comparePrice ?? undefined}
						badge={productBadge(product)}
					/>
				{/each}
			</div>
		</section>
	{/if}

	<!-- 5. Learn + Affiliate split -->
	<section class="section container">
		<div class="split">
			<a class="learn-card" href="/learn">
				<span class="learn-card__eyebrow">Learn hub</span>
				<h2 class="learn-card__title">Guides written by people with dirt on their keyboards.</h2>
				<p class="learn-card__body">
					Step-by-step growing guides, troubleshooting, and field notes straight from our own test
					beds — free to read, no account required.
				</p>
				<span class="learn-card__link">Explore the guides &rarr;</span>
			</a>

			<div id="affiliate" class="affiliate-card">
				<span class="affiliate-card__eyebrow">Affiliate program</span>
				<h2 class="affiliate-card__title">Teach people to grow. Earn while you do.</h2>
				<p class="affiliate-card__body">
					Share the systems you already trust and earn a fair cut on every grower you send our way.
					Built for educators, market gardeners, and anyone with a following that grows.
				</p>
				<Button href="/affiliate/join" variant="primary" size="lg">Join the program</Button>
			</div>
		</div>
	</section>
</div>

<style>
	.home {
		min-height: 100vh;
	}

	.container {
		max-width: 1240px;
		margin: 0 auto;
		padding-left: 24px;
		padding-right: 24px;
	}

	.section {
		margin-top: clamp(64px, 9vw, 112px);
	}

	/* ---------- Hero ---------- */
	.home-hero {
		display: grid;
		grid-template-columns: 1.05fr 1fr;
		gap: 56px;
		align-items: center;
		padding-top: 80px;
		padding-bottom: 40px;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 8px 16px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: #1c3527;
	}

	.status-badge__dot {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: linear-gradient(180deg, #a8e6c8, #4ea786);
		box-shadow: 0 0 0 3px rgba(143, 216, 180, 0.28);
	}

	.hero__title {
		margin: 22px 0 0;
		font-family: var(--font-display);
		font-size: clamp(40px, 6vw, 64px);
		font-weight: 600;
		line-height: 1.02;
		letter-spacing: -0.02em;
		color: #1c3527;
		text-wrap: balance;
	}

	.hero__lead {
		margin: 22px 0 0;
		max-width: 34rem;
		font-family: var(--font-body);
		font-size: 19px;
		line-height: 1.55;
		color: #4a5f52;
		text-wrap: pretty;
	}

	.hero__ctas {
		margin-top: 30px;
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}

	.hero__stats {
		margin-top: 40px;
		display: flex;
		flex-wrap: wrap;
		gap: 34px;
	}

	.hero-stat {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.hero-stat__value {
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
		color: #1c3527;
	}

	.hero-stat__label {
		font-family: var(--font-body);
		font-size: 13.5px;
		color: #5a7263;
	}

	/* Hero visual */
	.hero__right {
		position: relative;
	}

	.hero-visual {
		position: relative;
		border-radius: 32px;
		overflow: visible;
	}

	.hero-visual__img {
		display: block;
		width: 100%;
		height: clamp(360px, 42vw, 540px);
		object-fit: cover;
		border-radius: 32px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 22px 60px rgba(23, 48, 31, 0.22);
	}

	.float-card {
		position: absolute;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 14px 18px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 12px 30px rgba(23, 48, 31, 0.18);
	}

	.float-card--top {
		top: 26px;
		left: -22px;
	}

	.float-card--bottom {
		bottom: 26px;
		right: -22px;
	}

	.float-card__value {
		font-family: var(--font-display);
		font-size: 19px;
		font-weight: 700;
		letter-spacing: -0.015em;
		color: #1c3527;
	}

	.float-card__label {
		font-family: var(--font-body);
		font-size: 12.5px;
		line-height: 1.3;
		color: #5a7263;
	}

	/* ---------- Systems ---------- */
	.systems-grid {
		margin-top: 40px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 22px;
	}

	/* ---------- Why Aevani ---------- */
	.why {
		display: grid;
		grid-template-columns: 0.85fr 1.15fr;
		gap: clamp(28px, 4vw, 56px);
		align-items: start;
	}

	.why__eyebrow {
		display: block;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #2e6b4f;
	}

	.why__title {
		margin: 12px 0 0;
		font-family: var(--font-display);
		font-size: clamp(28px, 3.4vw, 36px);
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.015em;
		color: #1c3527;
		text-wrap: balance;
	}

	.why__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 28px 32px;
	}

	.value__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 19px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #1c3527;
	}

	.value__body {
		margin: 8px 0 0;
		font-family: var(--font-body);
		font-size: 14.5px;
		line-height: 1.55;
		color: #4a5f52;
		text-wrap: pretty;
	}

	/* ---------- Featured ---------- */
	.featured-grid {
		margin-top: 40px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
	}

	/* ---------- Learn + Affiliate split ---------- */
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}

	.learn-card,
	.affiliate-card {
		display: flex;
		flex-direction: column;
		border-radius: 28px;
		padding: clamp(28px, 3.4vw, 44px);
	}

	/* Dark Learn hub card */
	.learn-card {
		text-decoration: none;
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(600px 300px at 90% -10%, rgba(143, 216, 180, 0.22) 0%, transparent 60%),
			linear-gradient(150deg, #1e4a36 0%, #14261b 100%);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 16px 44px rgba(20, 38, 27, 0.28);
		transition:
			transform 300ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			box-shadow 300ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.learn-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 56px rgba(20, 38, 27, 0.34);
	}

	.learn-card__eyebrow {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #8fd8b4;
	}

	.learn-card__title {
		margin: 14px 0 0;
		font-family: var(--font-display);
		font-size: clamp(24px, 2.8vw, 32px);
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: -0.015em;
		color: #f4f1ea;
		text-wrap: balance;
	}

	.learn-card__body {
		margin: 16px 0 0;
		font-family: var(--font-body);
		font-size: 15.5px;
		line-height: 1.6;
		color: #dce6dd;
		text-wrap: pretty;
	}

	.learn-card__link {
		margin-top: auto;
		padding-top: 24px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		color: #a8e6c8;
	}

	/* Glass Affiliate card */
	.affiliate-card {
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 10px 34px rgba(23, 48, 31, 0.12);
	}

	.affiliate-card__eyebrow {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #2e6b4f;
	}

	.affiliate-card__title {
		margin: 14px 0 0;
		font-family: var(--font-display);
		font-size: clamp(24px, 2.8vw, 32px);
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: -0.015em;
		color: #1c3527;
		text-wrap: balance;
	}

	.affiliate-card__body {
		margin: 16px 0 24px;
		font-family: var(--font-body);
		font-size: 15.5px;
		line-height: 1.6;
		color: #4a5f52;
		text-wrap: pretty;
	}

	.affiliate-card :global(.btn-plant) {
		margin-top: auto;
		align-self: flex-start;
	}

	/* ---------- Responsive ---------- */
	@media (max-width: 960px) {
		.home-hero {
			grid-template-columns: 1fr;
			gap: 44px;
			padding-top: 56px;
		}

		.hero__right {
			order: -1;
		}

		.systems-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.why {
			grid-template-columns: 1fr;
			gap: 28px;
		}

		.featured-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 640px) {
		.hero__stats {
			gap: 22px;
		}

		.float-card--top {
			left: 10px;
		}

		.float-card--bottom {
			right: 10px;
		}

		.systems-grid {
			grid-template-columns: 1fr;
		}

		.why__grid {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.featured-grid {
			grid-template-columns: 1fr;
		}

		.split {
			grid-template-columns: 1fr;
		}
	}
</style>
