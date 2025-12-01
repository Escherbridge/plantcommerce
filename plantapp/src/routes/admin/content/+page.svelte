<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold">Content Management</h1>
		<a href="/admin/content/new" class="btn btn-primary">+ Create Content</a>
	</div>

	<div class="flex gap-2">
		<a href="/admin/content?type=blog" class="btn btn-sm btn-outline">Blog Posts</a>
		<a href="/admin/content?type=guide" class="btn btn-sm btn-outline">Guides</a>
		<a href="/admin/content?type=faq" class="btn btn-sm btn-outline">FAQs</a>
		<a href="/admin/content?type=page" class="btn btn-sm btn-outline">Pages</a>
	</div>

	{#if data.content && data.content.length > 0}
		<div class="overflow-x-auto">
			<table class="table">
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
					{#each data.content as item}
						<tr>
							<td class="font-semibold">{item.title}</td>
							<td><span class="badge badge-outline">{item.type}</span></td>
							<td>
								<span class="badge {item.isPublished ? 'badge-success' : 'badge-ghost'}">
									{item.isPublished ? 'Published' : 'Draft'}
								</span>
							</td>
							<td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}</td>
							<td>
								<a href="/admin/content/{item.id}" class="btn btn-xs btn-outline">Edit</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-center py-8">No content found</p>
	{/if}
</div>
