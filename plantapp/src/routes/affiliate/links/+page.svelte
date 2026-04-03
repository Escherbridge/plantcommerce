<script lang="ts">
	import '$lib/components/platform/platform.css';
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';

	let { data }: { data: PageData } = $props();

	let selectedProduct: any = $state(null);
	let generatedLink = $state('');
	let customSlug = $state('');
	let searchQuery = $state('');
	let sortColumn = $state<'clicks' | 'conversions' | 'earnings'>('clicks');
	let sortDirection = $state<'asc' | 'desc'>('desc');
	let copiedId = $state<string | null>(null);

	const filteredLinks = $derived(() => {
		const links = data.links || [];
		if (!searchQuery) return links;
		return links.filter((link: any) =>
			(link.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	const sortedLinks = $derived(() => {
		const links = [...filteredLinks()];
		links.sort((a: any, b: any) => {
			let aVal = 0;
			let bVal = 0;
			if (sortColumn === 'clicks') {
				aVal = a.clicks || 0;
				bVal = b.clicks || 0;
			} else if (sortColumn === 'conversions') {
				aVal = a.conversions || 0;
				bVal = b.conversions || 0;
			} else {
				aVal = parseFloat(a.earnings || '0');
				bVal = parseFloat(b.earnings || '0');
			}
			return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
		});
		return links;
	});

	function toggleSort(col: 'clicks' | 'conversions' | 'earnings') {
		if (sortColumn === col) {
			sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
		} else {
			sortColumn = col;
			sortDirection = 'desc';
		}
	}

	async function generateLink() {
		if (!selectedProduct) return;
		try {
			const result = await trpc().affiliate.generateLink.mutate({
				productId: selectedProduct.id,
				customSlug: customSlug || undefined
			});
			generatedLink = result.url;
		} catch (error) {
			console.error('Error generating link:', error);
		}
	}

	function copyLink(link: string, id?: string) {
		navigator.clipboard.writeText(link);
		if (id) {
			copiedId = id;
			setTimeout(() => (copiedId = null), 2000);
		}
	}

	let genCopied = $state(false);
	function copyGeneratedLink() {
		navigator.clipboard.writeText(generatedLink);
		genCopied = true;
		setTimeout(() => (genCopied = false), 2000);
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Affiliate Links</h1>
		<p class="platform-header__subtitle">
			Generate and manage your affiliate links for products. Track performance and optimize your campaigns.
		</p>
	</div>

	<!-- Link Generator -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Generate New Link</h2>
		</div>
		<div class="platform-form-grid">
			<div class="field">
				<label for="product-select" class="field-label">Select Product</label>
				<select id="product-select" class="field-input" bind:value={selectedProduct}>
					<option value={null}>Choose a product...</option>
					{#if data.products}
						{#each data.products as product}
							<option value={product}>{product.name}</option>
						{/each}
					{/if}
				</select>
			</div>
			<div class="field">
				<label for="custom-slug" class="field-label">Custom Identifier (Optional)</label>
				<input
					id="custom-slug"
					type="text"
					placeholder="e.g., summer-promo"
					class="field-input"
					bind:value={customSlug}
				/>
			</div>
		</div>
		<div class="platform-card__actions">
			<button class="generate-btn" onclick={generateLink} disabled={!selectedProduct}>
				Generate Link
			</button>
		</div>

		{#if generatedLink}
			<div class="generated-result">
				<span class="field-label">Your Affiliate Link</span>
				<div class="code-row">
					<input type="text" value={generatedLink} readonly class="field-input generated-url" />
					<button class="platform-action-btn copy-sm-btn" onclick={copyGeneratedLink}>
						{#if genCopied}
							Copied
						{:else}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
								<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
							</svg>
							Copy
						{/if}
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Search -->
	<div class="search-bar">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
			<circle cx="11" cy="11" r="8"/>
			<line x1="21" y1="21" x2="16.65" y2="16.65"/>
		</svg>
		<input
			type="text"
			placeholder="Search links by product name..."
			class="search-input"
			bind:value={searchQuery}
		/>
	</div>

	<!-- Links Table -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Your Links</h2>
		</div>
		{#if sortedLinks().length > 0}
			<div class="platform-table-wrapper" style="border:none;">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Product</th>
							<th>Link</th>
							<th class="sortable-th" onclick={() => toggleSort('clicks')}>
								Clicks
								{#if sortColumn === 'clicks'}
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sort-arrow" class:sort-arrow--asc={sortDirection === 'asc'}>
										<path d="M6 9l6 6 6-6"/>
									</svg>
								{/if}
							</th>
							<th class="sortable-th" onclick={() => toggleSort('conversions')}>
								Conversions
								{#if sortColumn === 'conversions'}
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sort-arrow" class:sort-arrow--asc={sortDirection === 'asc'}>
										<path d="M6 9l6 6 6-6"/>
									</svg>
								{/if}
							</th>
							<th class="sortable-th" onclick={() => toggleSort('earnings')}>
								Earnings
								{#if sortColumn === 'earnings'}
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sort-arrow" class:sort-arrow--asc={sortDirection === 'asc'}>
										<path d="M6 9l6 6 6-6"/>
									</svg>
								{/if}
							</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedLinks() as link}
							<tr class:row--inactive={link.inactive}>
								<td>
									<div class="product-name">{link.product?.name || 'N/A'}</div>
									{#if link.customSlug}
										<div class="product-slug">{link.customSlug}</div>
									{/if}
									{#if link.inactive}
										<span class="platform-badge platform-badge--ghost">Inactive</span>
									{/if}
								</td>
								<td>
									<div class="link-url">{link.url}</div>
								</td>
								<td>
									<span class="platform-badge platform-badge--primary">{link.clicks || 0}</span>
								</td>
								<td>
									<span class="platform-badge platform-badge--secondary">{link.conversions || 0}</span>
								</td>
								<td class="earnings-cell">
									${link.earnings ? parseFloat(link.earnings).toFixed(2) : '0.00'}
								</td>
								<td>
									<div class="action-group">
										<button
											class="platform-action-btn copy-sm-btn"
											onclick={() => copyLink(link.url, link.id)}
										>
											{#if copiedId === link.id}
												Copied
											{:else}
												Copy Link
											{/if}
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No links found</p>
				<p class="platform-empty__text">
					{searchQuery
						? 'No links match your search. Try a different term.'
						: 'Create your first affiliate link above to get started.'}
				</p>
			</div>
		{/if}
	</div>

	<!-- Best Practices -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Link Best Practices</h2>
		</div>
		<ul class="best-practices">
			<li>Use custom identifiers to track different campaigns or platforms</li>
			<li>Test your links before sharing to ensure they work correctly</li>
			<li>Disclose affiliate relationships according to FTC guidelines</li>
			<li>Track performance regularly to optimize your promotion strategy</li>
			<li>Use deep links to specific products for better conversion rates</li>
		</ul>
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-family: var(--font-display);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(var(--bc) / 0.5);
	}

	.field-input {
		padding: 0.625rem 0.875rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
		font-family: var(--font-body);
		transition: border-color 150ms ease;
	}

	.field-input:focus {
		outline: none;
		border-color: oklch(var(--p));
	}

	.generate-btn {
		padding: 0.625rem 1.5rem;
		background: oklch(var(--p));
		color: oklch(var(--pc));
		border: none;
		border-radius: var(--input-radius, 10px);
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.generate-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.generate-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.generated-result {
		margin-top: 1.25rem;
		padding: 1rem;
		background: oklch(var(--b2));
		border-radius: calc(var(--input-radius, 10px) - 2px);
		border: 1px solid var(--input-border);
	}

	.code-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.375rem;
	}

	.generated-url {
		flex: 1;
		font-family: var(--font-mono, monospace);
		font-size: 0.8125rem;
	}

	.copy-sm-btn {
		width: auto;
		flex-shrink: 0;
		padding: 0.5rem 0.75rem;
	}

	.btn-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		transition: border-color 150ms ease;
	}

	.search-bar:focus-within {
		border-color: oklch(var(--p));
	}

	.search-icon {
		width: 1rem;
		height: 1rem;
		color: oklch(var(--bc) / 0.4);
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 0.875rem;
		color: oklch(var(--bc));
		outline: none;
	}

	.search-input::placeholder {
		color: oklch(var(--bc) / 0.35);
	}

	.sortable-th {
		cursor: pointer;
		user-select: none;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.sortable-th:hover {
		color: oklch(var(--bc) / 0.8);
	}

	.sort-arrow {
		width: 0.875rem;
		height: 0.875rem;
		transition: transform 150ms ease;
	}

	.sort-arrow--asc {
		transform: rotate(180deg);
	}

	.product-name {
		font-weight: 600;
		color: oklch(var(--bc));
	}

	.product-slug {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
	}

	.link-url {
		font-family: var(--font-mono, monospace);
		font-size: 0.75rem;
		max-width: 14rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.earnings-cell {
		font-weight: 600;
		color: oklch(var(--su));
	}

	.action-group {
		display: flex;
		gap: 0.5rem;
	}

	.row--inactive {
		opacity: 0.5;
	}

	.best-practices {
		list-style: disc;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.7);
	}
</style>
