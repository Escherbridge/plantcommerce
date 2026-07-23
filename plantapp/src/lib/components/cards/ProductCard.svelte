<script lang="ts">
	// Aevani product card. Standard = glass card with image on top; featured = full-bleed
	// image tile with overlay caption. See design-spec.md §4.5 / §6.
	interface Props {
		href: string;
		image: string;
		imageAlt: string;
		title: string;
		category: string;
		description?: string;
		price: number | string;
		compareAt?: number | string;
		badge?: string;
		variant?: 'standard' | 'featured';
		class?: string;
	}

	let {
		href,
		image,
		imageAlt,
		title,
		category,
		description,
		price,
		compareAt,
		badge,
		variant = 'standard',
		class: className = ''
	}: Props = $props();

	const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

	/** Format numbers and numeric strings as $X.XX; pass non-numeric strings through unchanged. */
	function formatPrice(value: number | string): string {
		if (typeof value === 'number') {
			return Number.isFinite(value) ? usd.format(value) : String(value);
		}
		const trimmed = value.trim();
		const parsed = Number(trimmed.replace(/[^0-9.-]/g, ''));
		return trimmed !== '' && Number.isFinite(parsed) ? usd.format(parsed) : value;
	}

	const priceLabel = $derived(formatPrice(price));
	const compareLabel = $derived(compareAt != null ? formatPrice(compareAt) : undefined);
</script>

{#if variant === 'featured'}
	<a {href} class="pc pc--featured {className}">
		<div class="pc__media pc__media--full">
			<img class="pc__img" src={image} alt={imageAlt} loading="lazy" />
			<div class="pc__scrim" aria-hidden="true"></div>
			{#if badge}
				<span class="pc__badge">{badge}</span>
			{/if}
			<div class="pc__caption">
				<span class="pc__eyebrow pc__eyebrow--dark">{category}</span>
				<h3 class="pc__title pc__title--dark">{title}</h3>
				<span class="pc__price pc__price--mint">{priceLabel}</span>
			</div>
		</div>
	</a>
{:else}
	<a {href} class="pc pc--standard {className}">
		<div class="pc__media">
			<img class="pc__img" src={image} alt={imageAlt} loading="lazy" />
			<div class="pc__sheen" aria-hidden="true"></div>
			{#if badge}
				<span class="pc__badge">{badge}</span>
			{/if}
		</div>
		<div class="pc__body">
			<span class="pc__eyebrow">{category}</span>
			<h3 class="pc__title">{title}</h3>
			{#if description}
				<p class="pc__desc">{description}</p>
			{/if}
			<div class="pc__footer">
				<span class="pc__price">
					{priceLabel}
					{#if compareLabel}
						<span class="pc__compare">{compareLabel}</span>
					{/if}
				</span>
				<span class="pc__view">View &rarr;</span>
			</div>
		</div>
	</a>
{/if}

<style>
	.pc {
		display: block;
		text-decoration: none;
		transition:
			transform 300ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)),
			box-shadow 300ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	/* ---- Standard ---- */
	.pc--standard {
		border-radius: 24px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 8px 26px rgba(23, 48, 31, 0.1);
	}

	.pc--standard:hover {
		transform: translateY(-4px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 16px 40px rgba(23, 48, 31, 0.16);
	}

	.pc__media {
		position: relative;
		height: 190px;
		overflow: hidden;
	}

	.pc__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 500ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1));
	}

	.pc--standard:hover .pc__img {
		transform: scale(1.04);
	}

	.pc__sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 42%);
		pointer-events: none;
	}

	.pc__badge {
		position: absolute;
		top: 14px;
		left: 14px;
		padding: 6px 12px;
		border-radius: 999px;
		background: rgba(20, 38, 27, 0.55);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #eaf6ee;
	}

	.pc__body {
		padding: 18px 20px 20px;
	}

	.pc__eyebrow {
		display: block;
		font-family: var(--font-body);
		font-size: 11.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #7c9585;
	}

	.pc__title {
		margin: 8px 0 0;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: #1c3527;
	}

	.pc__desc {
		margin: 8px 0 0;
		font-family: var(--font-body);
		font-size: 13.5px;
		line-height: 1.5;
		color: #5a7263;
		text-wrap: pretty;
	}

	.pc__footer {
		margin-top: 16px;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.pc__price {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		color: #1c3527;
	}

	.pc__compare {
		margin-left: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #7c9585;
		text-decoration: line-through;
	}

	.pc__view {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 600;
		color: #2e6b4f;
		white-space: nowrap;
	}

	/* ---- Featured ---- */
	.pc--featured {
		position: relative;
		border-radius: 24px;
		overflow: hidden;
		min-height: 360px;
		border: 1px solid rgba(255, 255, 255, 0.5);
		box-shadow: 0 12px 34px rgba(23, 48, 31, 0.16);
	}

	.pc--featured:hover {
		transform: translateY(-4px);
		box-shadow: 0 20px 48px rgba(23, 48, 31, 0.22);
	}

	.pc__media--full {
		position: absolute;
		inset: 0;
		height: 100%;
	}

	.pc--featured .pc__img {
		position: absolute;
		inset: 0;
	}

	.pc--featured:hover .pc__img {
		transform: scale(1.05);
	}

	.pc__scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(20, 38, 27, 0) 30%,
			rgba(20, 38, 27, 0.35) 62%,
			rgba(20, 38, 27, 0.82) 100%
		);
	}

	.pc__caption {
		position: absolute;
		inset: auto 0 0 0;
		padding: 26px 26px 28px;
	}

	.pc__eyebrow--dark {
		color: #a8e6c8;
	}

	.pc__title--dark {
		margin: 8px 0 0;
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.015em;
		color: #ffffff;
	}

	.pc__price--mint {
		display: block;
		margin-top: 10px;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		color: #8fd8b4;
	}
</style>
