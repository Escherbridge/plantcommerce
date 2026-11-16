<script lang="ts">
	import { SystemCard } from '$lib/components/cards';
	import { SectionHeader, GlassCard, Button } from '$lib/components/ui';
	import { assetManifest } from '$lib/data/assetManifest';

	// Growing systems — four ways to grow, each linking to its catalogue slug.
	const systems = [
		{
			number: '01',
			title: 'Hydroponics',
			href: '/products/hydroponics',
			image: assetManifest.verticalTower,
			description: 'Soil-free growing that fits more harvest into less space.'
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

	// Why Aevani — practical marketplace & grower principles.
	const values = [
		{
			title: 'Built for small makers',
			body: 'No listing fees, no monthly rent, and no mandatory ad tax. Sellers pay one flat 8% commission with card processing included.'
		},
		{
			title: 'Field-first guides',
			body: 'Free, practical troubleshooting for EC, pH, clay raised beds, aquaponics biofilters, and hot-summer tunnels—no account required.'
		},
		{
			title: 'Plan the site first',
			body: 'Map yard sunlight, slope, windbreak placement, and hose reach in 3D on PlantGeo before cutting lumber or ordering pumps.'
		},
		{
			title: 'Clear seller terms',
			body: 'Independent growers and toolmakers will set shipping, returns, and warranties on their real listings.'
		}
	];
</script>

<div class="home">
	<!-- 1. Hero -->
	<section class="home-hero container">
		<div class="hero__left">
			<span class="status-badge">
				<span class="status-badge__dot" aria-hidden="true"></span>
				Open for independent growers, seed houses & makers
			</span>

			<h1 class="hero__title">Grow something that outlasts the season.</h1>

			<p class="hero__lead">
				Practical field guides for hydroponics, backyard beds, aquaponics, and agroforestry—paired
				with a fair marketplace where independent seed sellers and toolmakers keep 92% under a flat
				8% commission.
			</p>

			<div class="hero__ctas">
				<Button href="/guides" variant="primary" size="lg">Explore Growing Guides</Button>
				<Button href="/sell" variant="secondary" size="lg">Sell on Aevani</Button>
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
					<span class="float-card__value">Flat 8%</span>
					<span class="float-card__label">Card processing included</span>
				</div>
				<div class="float-card float-card--bottom">
					<span class="float-card__value">38+ Guides</span>
					<span class="float-card__label">Free hydro, soil & tunnel playbooks</span>
				</div>
			</div>
		</div>
	</section>

	<!-- 2. Systems -->
	<section id="systems" class="section container">
		<SectionHeader
			eyebrow="Four ways to grow"
			title="Systems, beds, and tools matched to your space."
			actionLabel="Browse categories"
			actionHref="/products"
		/>
		<p class="systems-intro">
			Explore hydroponic, aquaponic, silvopasture, and agroforestry categories side by side with our
			free field guides. Sketch yard sun angles, slopes, and layout first on
			<a href="https://plantgeo.aevani.com">PlantGeo</a> before ordering lumber or pumps.
		</p>
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
					<h2 class="why__title">Plain math for sellers. Useful guides for growers.</h2>
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

	<section class="section container">
		<div class="silhouette">
			<p class="silhouette__eyebrow">Growing Catalogue</p>
			<h2 class="silhouette__title">Gear organized around real growing systems.</h2>
			<p class="silhouette__body">
				Walk our hydroponic, aquaponic, silvopasture, and agroforestry categories—from Kratky
				propagation trays and EC meters to heirloom seeds and orchard supplies—with seller
				storefronts onboarding directly on Aevani.
			</p>
			<a class="silhouette__link" href="/products">Explore growing categories</a>
		</div>
	</section>

	<!-- 5. Learn + Seller split -->
	<section class="section container">
		<div class="split">
			<a class="learn-card" href="/learn">
				<span class="learn-card__eyebrow">Learn hub</span>
				<h2 class="learn-card__title">Hands-on guides & seasonal field notes.</h2>
				<p class="learn-card__body">
					Read side-by-side trade-offs on DWC vs. Kratky, backyard raised-bed depth over heavy clay,
					and aquaponic biofilter cycling—free with no account required.
				</p>
				<span class="learn-card__link">Open the Learn hub</span>
			</a>

			<div id="affiliate" class="affiliate-card">
				<span class="affiliate-card__eyebrow">Independent Sellers</span>
				<h2 class="affiliate-card__title">Open your storefront at a flat 8% commission.</h2>
				<p class="affiliate-card__body">
					Keep 92% of every sale. Card processing is included inside the 8% fee with zero listing
					fees, zero monthly fees, and zero mandatory ad surcharges. A PlantGeo creator referral
					path will open later once terms are finalized.
				</p>
				<div class="affiliate-card__actions">
					<Button href="/sell" variant="primary" size="lg">Sell on Aevani</Button>
					<a class="affiliate-card__secondary" href="https://plantgeo.aevani.com"
						>Plan a site on PlantGeo</a
					>
				</div>
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
	.systems-intro {
		max-width: 68ch;
		margin: 18px 0 0;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: #3d5246;
	}

	.systems-intro a {
		font-weight: 600;
		color: #1e4a36;
	}

	.systems-grid {
		margin-top: 28px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 22px;
	}

	.silhouette {
		max-width: 68ch;
		padding: clamp(28px, 4vw, 48px);
		border: 1px solid #e3dbc9;
		background: #ede7da;
	}

	.silhouette__eyebrow {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #2e6b4f;
	}

	.silhouette__title {
		margin: 12px 0 0;
		font-family: var(--font-display);
		font-size: clamp(28px, 3vw, 40px);
		font-weight: 600;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: #22362a;
	}

	.silhouette__body {
		margin: 16px 0 0;
		font-size: 16px;
		line-height: 1.5;
		color: #22362a;
	}

	.silhouette__link {
		display: inline-block;
		margin-top: 20px;
		font-weight: 600;
		color: #1e4a36;
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

	.affiliate-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 24px;
		align-items: center;
		margin-top: auto;
	}

	.affiliate-card__secondary {
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		color: #1e4a36;
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
	}

	@media (max-width: 640px) {
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

		.split {
			grid-template-columns: 1fr;
		}
	}
</style>
