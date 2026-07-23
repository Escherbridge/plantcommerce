<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { Container } from '$lib/components/layout';
	import { ProductGallery, ProductCard } from '$lib/components/cards';
	import { StatTile, SectionHeader, Badge, Button, GlassCard } from '$lib/components/ui';
	import { onMount } from 'svelte';
	import { sanitizeRichText } from '$lib/utils/sanitizeRichText';
	import { formatRelativeTime, formatAbsoluteDate } from '$lib/utils/relativeTime';
	import { cart } from '$lib/stores/cart';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const p = $derived(data.product);

	// Review dates render a deterministic absolute date during SSR + hydration
	// (identical on server and client), then upgrade to relative time after mount
	// so the two never disagree. Prevents `hydration_html_changed`.
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	function reviewDate(value: Date | string): string {
		return mounted ? formatRelativeTime(value) : formatAbsoluteDate(value);
	}

	let quantity = $state(1);
	let adding = $state(false);
	let addBundle = $state(false);

	const productUrl = $derived(`/products/${data.categorySlug}/${p.slug}`);

	// ---- Currency-aware price formatting (currency from the model; default USD → $). ----
	const currencyCode = $derived((p.currency || 'USD').toUpperCase());
	function fmtPrice(value: string | number | null | undefined): string {
		if (value === null || value === undefined || value === '') return '';
		const num = typeof value === 'number' ? value : parseFloat(value);
		if (!Number.isFinite(num)) return '';
		try {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(
				num
			);
		} catch {
			return `$${num.toFixed(2)}`;
		}
	}

	// ---- Plain-text meta description (never @html into meta). ----
	function stripHtml(html: string | null | undefined): string {
		if (!html) return '';
		return html
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	const metaDescription = $derived(
		p.shortDescription || stripHtml(p.description) || stripHtml(p.descriptionHtml)
	);
	const mainImageUrl = $derived(p.images?.[0]?.url);

	// ---- JSON-LD (Product + BreadcrumbList) as a single @graph script. ----
	// Rendered as one `{@html}` block so head hydration stays in lockstep (two
	// separate JSON-LD scripts after <SEO> trip `hydration_html_changed`).
	function serializeJsonLd(value: unknown): string {
		return JSON.stringify(value)
			.replaceAll('<', '\\u003c')
			.replaceAll('>', '\\u003e')
			.replaceAll('&', '\\u0026')
			.replaceAll(' ', '\\u2028')
			.replaceAll(' ', '\\u2029');
	}
	const productJsonLd = $derived(
		'<' +
			'script type="application/ld+json">' +
			serializeJsonLd({
				'@context': 'https://schema.org',
				'@graph': [
					{
						'@type': 'Product',
						name: p.name,
						description: metaDescription,
						image: mainImageUrl,
						brand: { '@type': 'Brand', name: 'Aevani' },
						offers: {
							'@type': 'Offer',
							price: p.price,
							priceCurrency: currencyCode,
							availability: p.inStock
								? 'https://schema.org/InStock'
								: 'https://schema.org/OutOfStock',
							url: `https://aevani.com${productUrl}`,
							itemCondition: 'https://schema.org/NewCondition'
						}
					},
					{
						'@type': 'BreadcrumbList',
						itemListElement: [
							{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aevani.com' },
							{
								'@type': 'ListItem',
								position: 2,
								name: p.category?.name || 'Products',
								item: `https://aevani.com/products/${data.categorySlug}`
							},
							{
								'@type': 'ListItem',
								position: 3,
								name: p.name,
								item: `https://aevani.com${productUrl}`
							}
						]
					}
				]
			}) +
			'<' +
			'/script>'
	);

	// ---- The long read: the ONLY @html on the page, always sanitized. ----
	const longReadHtml = $derived(sanitizeRichText(p.descriptionHtml || p.description || ''));
	const hasLongRead = $derived(stripHtml(p.descriptionHtml || p.description || '').length > 0);

	// ---- Gallery images mapped to ProductGallery's {url, alt} contract. ----
	const galleryImages = $derived(
		(p.images ?? []).map((img) => ({ url: img.url, alt: img.altText ?? p.name }))
	);
	const galleryCaption = $derived(p.images?.[0]?.altText || p.category?.name || p.name);

	// ---- Buy-box running total (unit price × qty + optional bundle). ----
	const unitPrice = $derived(parseFloat(p.price) || 0);
	const bundlePrice = $derived(p.bundleOffer ? parseFloat(p.bundleOffer.price) || 0 : 0);
	const runningTotal = $derived(fmtPrice(unitPrice * quantity + (addBundle ? bundlePrice : 0)));

	const rating = $derived(p.ratingAverage ? parseFloat(p.ratingAverage) : 0);

	async function addToCart() {
		if (adding || !p.inStock) return;
		adding = true;
		try {
			await cart.addItem(p.id, quantity, p.name);
		} finally {
			adding = false;
		}
	}

	function decQty() {
		quantity = Math.max(1, quantity - 1);
	}
	function incQty() {
		quantity = Math.min(Math.max(1, p.stockQuantity || 99), quantity + 1);
	}
</script>

{#snippet starIcon()}
	<svg class="star" viewBox="0 0 24 24" aria-hidden="true">
		<path
			d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.3l-5.8 3.06 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z"
		/>
	</svg>
{/snippet}

{#snippet starRating(value: number, size: number)}
	<span class="stars" style="--star-size:{size}px" aria-label="{value.toFixed(1)} out of 5">
		<span class="stars__track">
			{#each [0, 1, 2, 3, 4] as _i (_i)}{@render starIcon()}{/each}
		</span>
		<span class="stars__fill" style="width:{Math.max(0, Math.min(100, (value / 5) * 100))}%">
			{#each [0, 1, 2, 3, 4] as _i (_i)}{@render starIcon()}{/each}
		</span>
	</span>
{/snippet}

<svelte:head>
	<title>{p.name} - Aevani</title>
	<meta name="description" content={metaDescription} />

	<SEO
		title="{p.name} | Aevani"
		description={metaDescription}
		image={mainImageUrl}
		type="product"
		tags={[p.category?.name || 'Gardening']}
	/>

	<!--
		Product + breadcrumb JSON-LD are emitted as ONE `{@html}` @graph script.
		Two separate {@html} JSON-LD blocks after <SEO> desync during head hydration
		(hydration_html_changed); a single combined script hydrates cleanly while
		keeping both schemas in the SSR markup. See src/lib/utils/AGENTS.md.
	-->
	{@html productJsonLd}
</svelte:head>

<div class="pdp">
	<Container>
		<!-- 1. Breadcrumb -->
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href="/">Home</a>
			<span class="crumbs__sep" aria-hidden="true">/</span>
			<a href="/products/{data.categorySlug}">{p.category?.name || data.categorySlug}</a>
			<span class="crumbs__sep" aria-hidden="true">/</span>
			<span class="crumbs__current" aria-current="page">{p.name}</span>
		</nav>

		<!-- 2 + 3. Gallery + Buy box -->
		<div class="pdp-hero">
			<!-- 2. Gallery -->
			<div class="pdp-hero__gallery">
				{#if galleryImages.length > 0}
					<ProductGallery images={galleryImages} caption={galleryCaption} />
				{/if}
			</div>

			<!-- 3. Buy box -->
			<div class="pdp-hero__buy">
				<div class="buy">
					<!-- Badges + stock pill -->
					<div class="buy__badges">
						{#each p.badges as badge (badge)}
							<Badge variant="tag-green">{badge}</Badge>
						{/each}
						{#if p.inStock}
							<Badge variant="water">In stock</Badge>
						{:else}
							<Badge variant="dark-glass">Out of stock</Badge>
						{/if}
					</div>

					<h1 class="buy__title">{p.name}</h1>

					{#if p.shortDescription}
						<p class="buy__tagline">{p.shortDescription}</p>
					{/if}

					<!-- Price -->
					<div class="buy__price-row">
						<span class="buy__price">{fmtPrice(p.price)}</span>
						{#if p.comparePrice}
							<span class="buy__compare">{fmtPrice(p.comparePrice)}</span>
						{/if}
					</div>
					{#if p.shippingNote}
						<p class="buy__shipping">{p.shippingNote}</p>
					{/if}

					<!-- Key features checklist -->
					{#if p.keyFeatures.length > 0}
						<ul class="buy__features">
							{#each p.keyFeatures as feature (feature)}
								<li>
									<svg class="check" viewBox="0 0 24 24" aria-hidden="true">
										<path
											d="M5 13l4 4L19 7"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									<span>{feature}</span>
								</li>
							{/each}
						</ul>
					{/if}

					<!-- Qty + add to cart -->
					<div class="buy__actions">
						<div class="qty" role="group" aria-label="Quantity">
							<button type="button" class="qty__btn" onclick={decQty} disabled={!p.inStock}
								aria-label="Decrease quantity">−</button
							>
							<input
								class="qty__input"
								type="number"
								min="1"
								max={p.stockQuantity || 99}
								bind:value={quantity}
								disabled={!p.inStock}
								aria-label="Quantity"
							/>
							<button type="button" class="qty__btn" onclick={incQty} disabled={!p.inStock}
								aria-label="Increase quantity">+</button
							>
						</div>

						<Button
							variant="primary"
							size="lg"
							class="buy__cta"
							loading={adding}
							disabled={!p.inStock}
							onclick={addToCart}
						>
							{#if p.inStock}
								Add to cart · {runningTotal}
							{:else}
								Out of stock
							{/if}
						</Button>
					</div>

					<!-- Bundle offer -->
					{#if p.bundleOffer}
						<label class="bundle" class:bundle--on={addBundle}>
							<input type="checkbox" bind:checked={addBundle} />
							<span class="bundle__box" aria-hidden="true">
								<svg viewBox="0 0 24 24"
									><path
										d="M5 13l4 4L19 7"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/></svg
								>
							</span>
							<span class="bundle__text">
								<span class="bundle__title">
									{p.bundleOffer.title}
									<span class="bundle__price">{fmtPrice(p.bundleOffer.price)}</span>
									{#if p.bundleOffer.compareAt}
										<span class="bundle__compare">{fmtPrice(p.bundleOffer.compareAt)}</span>
									{/if}
								</span>
								{#if p.bundleOffer.blurb}
									<span class="bundle__blurb">{p.bundleOffer.blurb}</span>
								{/if}
							</span>
						</label>
					{/if}

					<!-- Trust tiles -->
					<div class="trust">
						<div class="trust__tile">
							<span class="trust__label">Free shipping</span>
							<span class="trust__sub">On qualifying orders</span>
						</div>
						<div class="trust__tile">
							<span class="trust__label">30-day returns</span>
							<span class="trust__sub">No-fuss guarantee</span>
						</div>
						{#if p.warranty}
							<div class="trust__tile">
								<span class="trust__label">Warranty</span>
								<span class="trust__sub">{p.warranty}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- 4. By the numbers -->
		{#if p.stats.length > 0}
			<section class="block">
				<SectionHeader eyebrow="By the numbers" title="Field-tested performance" />
				<div class="stats-grid">
					{#each p.stats as stat (stat.label)}
						<StatTile value={stat.value} label={stat.label} />
					{/each}
				</div>
			</section>
		{/if}

		<!-- 5. Specifications -->
		{#if p.specs.length > 0}
			<section class="block">
				<SectionHeader eyebrow="Specifications" title="The details that matter" />
				<GlassCard padding={0} class="specs">
					{#each p.specs as spec (spec.label)}
						<div class="specs__row">
							<span class="specs__label">{spec.label}</span>
							<span class="specs__value">{spec.value}</span>
						</div>
					{/each}
				</GlassCard>
			</section>
		{/if}

		<!-- 6. In the box -->
		{#if p.inTheBox.length > 0}
			<section class="block">
				<SectionHeader eyebrow="In the box" title="Everything that ships" />
				<GlassCard class="inbox">
					<ul class="inbox__list">
						{#each p.inTheBox as item (item)}
							<li>
								<svg class="check check--green" viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M5 13l4 4L19 7"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</GlassCard>
			</section>
		{/if}

		<!-- 7. From our test beds -->
		{#if p.testBedNote}
			<section class="block">
				<div class="testbed">
					<span class="testbed__eyebrow">From our test beds</span>
					<p class="testbed__note">{p.testBedNote}</p>
				</div>
			</section>
		{/if}

		<!-- 8. FAQ -->
		{#if p.faqs.length > 0}
			<section class="block">
				<SectionHeader eyebrow="FAQ" title="Questions, answered" />
				<div class="faq">
					{#each p.faqs as faq, i (faq.q)}
						<details class="faq__item" open={i === 0}>
							<summary class="faq__q">
								<span>{faq.q}</span>
								<svg class="faq__chevron" viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M6 9l6 6 6-6"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</summary>
							<p class="faq__a">{faq.a}</p>
						</details>
					{/each}
				</div>
			</section>
		{/if}

		<!-- 9. Growers also add / related -->
		{#if data.relatedProducts && data.relatedProducts.length > 0}
			<section class="block">
				<SectionHeader
					eyebrow="Growers also add"
					title="Pairs well with"
					actionLabel="Browse everything →"
					actionHref="/products"
				/>
				<div class="related-grid">
					{#each data.relatedProducts as rp (rp.id)}
						<ProductCard
							href={`/products/${rp.category?.slug ?? data.categorySlug}/${rp.slug}`}
							image={rp.images?.[0]?.url ?? ''}
							imageAlt={rp.images?.[0]?.altText ?? rp.name}
							title={rp.name}
							category={rp.category?.name ?? ''}
							description={rp.shortDescription ?? undefined}
							price={rp.price}
							compareAt={rp.comparePrice ?? undefined}
							badge={rp.badges?.[0]}
						/>
					{/each}
				</div>
			</section>
		{/if}

		<!-- 10. The long read -->
		{#if hasLongRead}
			<section class="block longread">
				<span class="longread__eyebrow">The long read</span>
				<h2 class="longread__title">Why we grow it this way</h2>
				<!-- Only @html on the page — always routed through sanitizeRichText. -->
				<div class="prose longread__body">
					{@html longReadHtml}
				</div>
			</section>
		{/if}

		<!-- 11. Reviews -->
		{#if p.reviews.length > 0}
			<section class="block">
				<SectionHeader eyebrow="Reviews" title="What growers say" />
				<div class="reviews__summary">
					<span class="reviews__avg">{rating.toFixed(1)}</span>
					{@render starRating(rating, 22)}
					<span class="reviews__count">
						{p.reviewCount || p.reviews.length}
						{(p.reviewCount || p.reviews.length) === 1 ? 'review' : 'reviews'}
					</span>
				</div>

				<div class="reviews__list">
					{#each p.reviews as review (review.id)}
						<GlassCard class="review">
							<div class="review__head">
								<div class="review__who">
									<span class="review__author">{review.authorName}</span>
									{#if review.isVerifiedPurchase}
										<span class="review__verified">
											<svg viewBox="0 0 24 24" aria-hidden="true"
												><path
													d="M5 13l4 4L19 7"
													fill="none"
													stroke="currentColor"
													stroke-width="2.5"
													stroke-linecap="round"
													stroke-linejoin="round"
												/></svg
											>
											Verified purchase
										</span>
									{/if}
								</div>
								<span class="review__date">{reviewDate(review.createdAt)}</span>
							</div>
							{@render starRating(review.rating, 15)}
							{#if review.title}
								<h3 class="review__title">{review.title}</h3>
							{/if}
							<p class="review__body">{review.body}</p>
						</GlassCard>
					{/each}
				</div>
			</section>
		{/if}
	</Container>
</div>

<style>
	.pdp {
		padding: 24px 0 96px;
	}

	/* ---- Breadcrumb ---- */
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding: 8px 0 28px;
		font-family: var(--font-body);
		font-size: 13.5px;
		color: #5a7263;
	}
	.crumbs a {
		color: #5a7263;
		text-decoration: none;
		transition: color 200ms ease;
	}
	.crumbs a:hover {
		color: #2e6b4f;
	}
	.crumbs__sep {
		color: #a9bcae;
	}
	.crumbs__current {
		color: #1c3527;
		font-weight: 600;
	}

	/* ---- Hero: gallery + buy box ---- */
	.pdp-hero {
		display: grid;
		grid-template-columns: 1.05fr 1fr;
		gap: 48px;
		align-items: start;
		margin-bottom: 40px;
	}

	.buy {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.buy__badges {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.buy__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.02em;
		color: #1c3527;
		text-wrap: balance;
	}

	.buy__tagline {
		margin: 0;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.55;
		color: #4a5f52;
		text-wrap: pretty;
	}

	.buy__price-row {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-top: 4px;
	}
	.buy__price {
		font-family: var(--font-display);
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #1c3527;
	}
	.buy__compare {
		font-family: var(--font-display);
		font-size: 19px;
		font-weight: 500;
		color: #7c9585;
		text-decoration: line-through;
	}
	.buy__shipping {
		margin: -6px 0 0;
		font-family: var(--font-body);
		font-size: 13.5px;
		color: #5a7263;
	}

	.buy__features {
		list-style: none;
		margin: 6px 0 0;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.buy__features li {
		display: flex;
		align-items: flex-start;
		gap: 11px;
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.45;
		color: #22362a;
	}
	.check {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		margin-top: 1px;
		padding: 3px;
		border-radius: 999px;
		background: rgba(46, 107, 79, 0.12);
		color: #2e6b4f;
		box-sizing: border-box;
	}
	.check--green {
		background: rgba(46, 107, 79, 0.14);
	}

	.buy__actions {
		display: flex;
		align-items: stretch;
		gap: 12px;
		margin-top: 6px;
	}

	.qty {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 6px 18px rgba(23, 48, 31, 0.08);
		padding: 4px;
	}
	.qty__btn {
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		border-radius: 999px;
		font-size: 20px;
		line-height: 1;
		color: #1c3527;
		cursor: pointer;
		transition: background-color 200ms ease;
	}
	.qty__btn:hover:not(:disabled) {
		background: rgba(46, 107, 79, 0.1);
	}
	.qty__btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.qty__input {
		width: 48px;
		height: 40px;
		border: none;
		background: transparent;
		text-align: center;
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 600;
		color: #1c3527;
		-moz-appearance: textfield;
		appearance: textfield;
	}
	.qty__input::-webkit-outer-spin-button,
	.qty__input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.qty__input:focus {
		outline: none;
	}

	:global(.buy__cta) {
		flex: 1;
	}

	/* Bundle offer card */
	.bundle {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px 18px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.55);
		border: 1px solid rgba(46, 107, 79, 0.18);
		cursor: pointer;
		transition:
			border-color 200ms ease,
			background-color 200ms ease;
	}
	.bundle--on {
		border-color: rgba(46, 107, 79, 0.5);
		background: rgba(143, 216, 180, 0.16);
	}
	.bundle input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	.bundle__box {
		flex-shrink: 0;
		width: 22px;
		height: 22px;
		margin-top: 1px;
		border-radius: 7px;
		border: 1.5px solid rgba(46, 107, 79, 0.4);
		background: #fff;
		display: grid;
		place-items: center;
		color: transparent;
		transition:
			background-color 180ms ease,
			color 180ms ease;
	}
	.bundle__box svg {
		width: 14px;
		height: 14px;
	}
	.bundle--on .bundle__box {
		background: linear-gradient(180deg, #347a56, #1e4a36);
		border-color: #1e4a36;
		color: #f4f1ea;
	}
	.bundle__text {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.bundle__title {
		font-family: var(--font-body);
		font-size: 14.5px;
		font-weight: 600;
		color: #1c3527;
	}
	.bundle__price {
		margin-left: 4px;
		color: #2e6b4f;
	}
	.bundle__compare {
		margin-left: 6px;
		font-weight: 500;
		color: #7c9585;
		text-decoration: line-through;
	}
	.bundle__blurb {
		font-size: 13px;
		color: #5a7263;
	}

	/* Trust tiles */
	.trust {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-top: 4px;
	}
	.trust__tile {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 14px 16px;
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
	}
	.trust__label {
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: #1c3527;
	}
	.trust__sub {
		font-family: var(--font-body);
		font-size: 12px;
		line-height: 1.35;
		color: #5a7263;
	}

	/* ---- Section blocks ---- */
	.block {
		margin-top: 64px;
	}

	.stats-grid {
		margin-top: 26px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}

	/* Specifications */
	:global(.specs) {
		margin-top: 26px;
		overflow: hidden;
	}
	.specs__row {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: 16px;
		padding: 15px 26px;
		border-bottom: 1px solid rgba(23, 48, 31, 0.08);
	}
	.specs__row:last-child {
		border-bottom: none;
	}
	.specs__label {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 600;
		color: #5a7263;
	}
	.specs__value {
		font-family: var(--font-body);
		font-size: 14.5px;
		color: #22362a;
	}

	/* In the box */
	:global(.inbox) {
		margin-top: 26px;
	}
	.inbox__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px 28px;
	}
	.inbox__list li {
		display: flex;
		align-items: flex-start;
		gap: 11px;
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.45;
		color: #22362a;
	}

	/* Test beds — dark honest note */
	.testbed {
		position: relative;
		overflow: hidden;
		border-radius: 26px;
		padding: 40px 44px;
		background: linear-gradient(150deg, #1e4a36, #14261b);
		box-shadow: 0 18px 44px rgba(23, 48, 31, 0.28);
	}
	.testbed::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			520px 260px at 88% -10%,
			rgba(143, 216, 180, 0.28) 0%,
			transparent 60%
		);
		pointer-events: none;
	}
	.testbed__eyebrow {
		position: relative;
		display: block;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #8fd8b4;
	}
	.testbed__note {
		position: relative;
		margin: 14px 0 0;
		font-family: var(--font-display);
		font-size: 21px;
		font-weight: 500;
		line-height: 1.45;
		letter-spacing: -0.01em;
		color: #dce6dd;
		text-wrap: pretty;
		max-width: 62ch;
	}

	/* FAQ */
	.faq {
		margin-top: 26px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.faq__item {
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.62);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
		padding: 4px 22px;
	}
	.faq__q {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 0;
		cursor: pointer;
		list-style: none;
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 600;
		color: #1c3527;
	}
	.faq__q::-webkit-details-marker {
		display: none;
	}
	.faq__chevron {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		color: #2e6b4f;
		transition: transform 220ms ease;
	}
	.faq__item[open] .faq__chevron {
		transform: rotate(180deg);
	}
	.faq__a {
		margin: 0;
		padding: 0 0 18px;
		font-family: var(--font-body);
		font-size: 15px;
		line-height: 1.6;
		color: #4a5f52;
		text-wrap: pretty;
		max-width: 68ch;
	}

	/* Related */
	.related-grid {
		margin-top: 26px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	/* The long read */
	.longread {
		max-width: 720px;
		margin-left: auto;
		margin-right: auto;
	}
	.longread__eyebrow {
		display: block;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #2e6b4f;
	}
	.longread__title {
		margin: 12px 0 0;
		font-family: var(--font-display);
		font-size: 34px;
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: -0.015em;
		color: #1c3527;
		text-wrap: balance;
	}
	.longread__body {
		margin-top: 22px;
	}
	.longread__body :global(p) {
		font-family: var(--font-body);
		font-size: 17px;
		line-height: 1.7;
		color: #22362a;
		margin: 0 0 18px;
		text-wrap: pretty;
	}
	.longread__body :global(h2),
	.longread__body :global(h3) {
		font-family: var(--font-display);
		color: #1c3527;
		letter-spacing: -0.01em;
		margin: 30px 0 12px;
	}
	.longread__body :global(a) {
		color: #2e6b4f;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.longread__body :global(ul),
	.longread__body :global(ol) {
		padding-left: 22px;
		margin: 0 0 18px;
		color: #22362a;
		font-family: var(--font-body);
		font-size: 17px;
		line-height: 1.7;
	}
	.longread__body :global(li) {
		margin-bottom: 8px;
	}
	.longread__body :global(blockquote) {
		margin: 20px 0;
		padding: 8px 20px;
		border-left: 3px solid #8fd8b4;
		color: #4a5f52;
		font-style: italic;
	}

	/* Reviews */
	.reviews__summary {
		margin-top: 24px;
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}
	.reviews__avg {
		font-family: var(--font-display);
		font-size: 40px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #1c3527;
		line-height: 1;
	}
	.reviews__count {
		font-family: var(--font-body);
		font-size: 14px;
		color: #5a7263;
	}
	.reviews__list {
		margin-top: 24px;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 18px;
	}
	:global(.review) {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.review__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.review__who {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.review__author {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 600;
		color: #1c3527;
	}
	.review__verified {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-body);
		font-size: 11.5px;
		font-weight: 600;
		color: #2e6b4f;
	}
	.review__verified svg {
		width: 13px;
		height: 13px;
	}
	.review__date {
		font-family: var(--font-body);
		font-size: 12.5px;
		color: #7c9585;
		white-space: nowrap;
	}
	.review__title {
		margin: 2px 0 0;
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 600;
		color: #1c3527;
	}
	.review__body {
		margin: 0;
		font-family: var(--font-body);
		font-size: 14.5px;
		line-height: 1.6;
		color: #4a5f52;
		text-wrap: pretty;
	}

	/* Star rating (custom SVG, fractional fill) */
	.stars {
		position: relative;
		display: inline-flex;
		line-height: 0;
	}
	.stars__track,
	.stars__fill {
		display: inline-flex;
		white-space: nowrap;
	}
	.stars__fill {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.stars :global(.star) {
		width: var(--star-size, 18px);
		height: var(--star-size, 18px);
	}
	.stars__track :global(.star) {
		fill: rgba(46, 107, 79, 0.18);
	}
	.stars__fill :global(.star) {
		fill: #2e6b4f;
	}

	/* ---- Responsive ---- */
	@media (min-width: 993px) {
		.pdp-hero__buy {
			position: sticky;
			top: 96px;
		}
	}

	@media (max-width: 992px) {
		.pdp-hero {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		.related-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.reviews__list {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.block {
			margin-top: 48px;
		}
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.inbox__list {
			grid-template-columns: 1fr;
		}
		.trust {
			grid-template-columns: 1fr;
		}
		.related-grid {
			grid-template-columns: 1fr;
		}
		.buy__title {
			font-size: 27px;
		}
		.testbed {
			padding: 28px 24px;
		}
		.longread__title {
			font-size: 27px;
		}
	}
</style>
