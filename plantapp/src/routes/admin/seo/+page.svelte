<script lang="ts">
	import { onMount } from 'svelte';

	let seoFields = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			loading = true;
			seoFields = [
				{
					id: '1',
					pageId: 'home',
					pageType: 'page',
					metaTitle: 'Aevani | Local Development Metadata Fixture',
					metaDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
					ogTitle: 'Aevani | Local Development Metadata Fixture',
					ogImage: '/images/AI-MockAssets/MAINHERO.png',
					robots: 'noindex, nofollow',
					updatedAt: new Date().toISOString()
				},
				{
					id: '2',
					pageId: 'products',
					pageType: 'category',
					metaTitle: 'Aevani Products | Local Development Metadata Fixture',
					metaDescription: 'Local development fixture only. Configure reviewed production metadata before publishing.',
					ogTitle: 'Aevani Products | Local Development Metadata Fixture',
					ogImage: '/images/AI-MockAssets/MAINHERO.png',
					robots: 'noindex, nofollow',
					updatedAt: new Date().toISOString()
				}
			];
		} catch (err) {
			error = 'Failed to load SEO fields';
			console.error(err);
		} finally {
			loading = false;
		}
	});

</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">SEO Management</h1>
		<p class="platform-header__subtitle">Reviewed metadata publishing is not available yet.</p>
	</div>
	<div class="platform-card">
		<p class="admin-seo-info-text">
			The records below are local development fixtures only. They are not a source of published metadata and cannot be edited or previewed here.
		</p>
	</div>

	{#if loading}
		<div class="platform-empty">
			<p class="platform-empty__text">Loading SEO fields...</p>
		</div>
	{:else if error}
		<div class="platform-card" style="border-color: oklch(var(--er) / 0.3)">
			<p style="color: oklch(var(--er)); font-size: 0.875rem">{error}</p>
		</div>
	{:else}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Page</th>
						<th>Meta Title</th>
						<th>Meta Description</th>
						<th>Last Updated</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each seoFields as field}
						<tr>
							<td>
								<div class="font-semibold">{field.pageId}</div>
								<div style="font-size: 0.75rem; color: oklch(var(--bc) / 0.45)">{field.pageType}</div>
							</td>
							<td>
								<div class="admin-seo-truncate" title={field.metaTitle}>
									{field.metaTitle}
								</div>
							</td>
							<td>
								<div class="admin-seo-truncate" title={field.metaDescription}>
									{field.metaDescription}
								</div>
							</td>
							<td>{new Date(field.updatedAt).toLocaleDateString()}</td>
							<td>
								<div class="admin-action-group">
									<button class="platform-action-btn admin-table-btn" disabled title="SEO publishing is unavailable">
										Edit unavailable
									</button>
									<button class="platform-action-btn admin-table-btn" disabled title="SEO publishing is unavailable">
										Preview unavailable
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Info Cards -->
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">About SEO Fields</h2>
			</div>
			<p class="admin-seo-info-text">
				A reviewed, persisted SEO workflow is required before metadata can be changed.
				Do not treat local fixtures as search or social metadata.
			</p>
			<div class="admin-seo-info-grid">
				<div class="admin-seo-info-card">
					<h3 class="admin-seo-info-title">Meta Title</h3>
					<p class="admin-seo-info-desc">Appears in browser tabs and search results (50-60 chars)</p>
				</div>
				<div class="admin-seo-info-card">
					<h3 class="admin-seo-info-title">Meta Description</h3>
					<p class="admin-seo-info-desc">Search result snippets (150-160 chars)</p>
				</div>
				<div class="admin-seo-info-card">
					<h3 class="admin-seo-info-title">Open Graph</h3>
					<p class="admin-seo-info-desc">Controls how pages look when shared on social media</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-seo-truncate {
		max-width: 16rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.8125rem;
	}

	.admin-action-group {
		display: flex;
		gap: 0.5rem;
	}

	.admin-table-btn {
		width: auto;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}

	.admin-seo-info-text {
		font-size: 0.875rem;
		color: oklch(var(--bc) / 0.6);
		margin: 0 0 1rem;
	}

	.admin-seo-info-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.admin-seo-info-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.admin-seo-info-card {
		padding: 1rem;
		background: oklch(var(--b2));
		border-radius: 8px;
	}

	.admin-seo-info-title {
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: oklch(var(--bc) / 0.85);
		margin: 0 0 0.25rem;
	}

	.admin-seo-info-desc {
		font-size: 0.8125rem;
		color: oklch(var(--bc) / 0.5);
		margin: 0;
	}
</style>
