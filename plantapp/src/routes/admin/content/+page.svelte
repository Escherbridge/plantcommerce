<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const content = $derived(data.content || []);

	function getStatusBadgeClass(item: any): string {
		if (item.isPublished) return 'platform-badge platform-badge--success';
		return 'platform-badge platform-badge--ghost';
	}

	function getStatusLabel(item: any): string {
		if (item.isPublished) return 'Published';
		return 'Draft';
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">Content Management</h1>
				<p class="platform-header__subtitle">Create and manage blog posts, guides, and pages</p>
			</div>
			<a href="/admin/content/new" class="platform-action-btn admin-header-btn">
				<svg
					viewBox="0 0 24 24"
					class="h-5 w-5"
					stroke="currentColor"
					stroke-width="1.5"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 5v14M5 12h14" />
				</svg>
				Create Content
			</a>
		</div>
	</div>

	<!-- Type Filter Tabs -->
	<div class="admin-type-tabs">
		<a href="/admin/content" class="platform-action-btn admin-tab-btn">All</a>
		<a href="/admin/content?type=blog" class="platform-action-btn admin-tab-btn">Blog Posts</a>
		<a href="/admin/content?type=guide" class="platform-action-btn admin-tab-btn">Guides</a>
		<a href="/admin/content?type=faq" class="platform-action-btn admin-tab-btn">FAQs</a>
		<a href="/admin/content?type=page" class="platform-action-btn admin-tab-btn">Pages</a>
	</div>

	{#if content.length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Type</th>
						<th>Status</th>
						<th>Published</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each content as item}
						<tr>
							<td class="font-semibold">{item.title}</td>
							<td>
								<span class="platform-badge platform-badge--ghost">{item.type}</span>
							</td>
							<td>
								<span class={getStatusBadgeClass(item)}>{getStatusLabel(item)}</span>
							</td>
							<td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}</td>
							<td>
								<a href="/admin/content/{item.id}" class="platform-action-btn admin-table-btn"
									>Edit</a
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">No Content Found</p>
			<p class="platform-empty__text">Create your first piece of content to get started.</p>
		</div>
	{/if}
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

	.admin-type-tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.admin-tab-btn {
		width: auto;
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
		text-decoration: none;
	}

	.admin-table-btn {
		width: auto;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		text-decoration: none;
	}
</style>
