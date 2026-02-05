<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc/client';

	let seoFields = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			loading = true;
			// This would call your API - for now, we'll mock it
			seoFields = [
				{
					id: '1',
					pageId: 'home',
					pageType: 'page',
					metaTitle: 'PlantCommerce | Sustainable Growing Tools & Supplies',
					metaDescription: 'Discover sustainable growing tools, hydroponic systems, and educational resources.',
					ogTitle: 'PlantCommerce | Sustainable Gardening',
					ogImage: '/images/AI-MockAssets/MAINHERO.png',
					robots: 'index, follow',
					updatedAt: new Date().toISOString()
				},
				{
					id: '2',
					pageId: 'products',
					pageType: 'category',
					metaTitle: 'Gardening Products & Supplies | PlantCommerce',
					metaDescription: 'Shop our collection of sustainable gardening products.',
					ogTitle: 'Gardening Products | PlantCommerce',
					ogImage: '/images/AI-MockAssets/MAINHERO.png',
					robots: 'index, follow',
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

	function handleSave(field: any) {
		console.log('Saving SEO field:', field);
		// Implement save logic here
		alert(`SEO fields for "${field.pageId}" saved!`);
	}
</script>

<div class="p-6">
	<h1 class="mb-6 text-2xl font-bold text-gray-900">CMS SEO Fields</h1>

	{#if loading}
		<div class="flex justify-center p-8">
			<div class="loading loading-spinner loading-lg"></div>
		</div>
	{:else if error}
		<div class="alert alert-error">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>{error}</span>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Page</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Meta Title</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Meta Description</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Updated</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each seoFields as field}
						<tr class="hover:bg-gray-50">
							<td class="whitespace-nowrap px-6 py-4">
								<div class="font-medium text-gray-900">{field.pageId}</div>
								<div class="text-sm text-gray-500">{field.pageType}</div>
							</td>
							<td class="px-6 py-4">
								<div class="max-w-xs truncate text-sm text-gray-900" title={field.metaTitle}>
									{field.metaTitle}
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="max-w-xs truncate text-sm text-gray-500" title={field.metaDescription}>
									{field.metaDescription}
								</div>
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
								{new Date(field.updatedAt).toLocaleDateString()}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
								<button
									onclick={() => handleSave(field)}
									class="text-primary hover:text-primary/80 mr-4"
								>
									Edit
								</button>
								<button
									onclick={() => console.log('Preview:', field)}
									class="text-gray-600 hover:text-gray-900"
								>
									Preview
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">About CMS SEO Fields</h2>
			<p class="text-gray-600">
				This is your content management system for SEO meta tags. Edit meta titles, descriptions,
				and Open Graph tags for each page. Changes here will affect how your pages appear in
				search results and social media shares.
			</p>
			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="rounded-lg bg-white p-4">
					<h3 class="font-medium text-gray-900">Meta Title</h3>
					<p class="mt-1 text-sm text-gray-500">Appears in browser tabs and search results (50-60 chars)</p>
				</div>
				<div class="rounded-lg bg-white p-4">
					<h3 class="font-medium text-gray-900">Meta Description</h3>
					<p class="mt-1 text-sm text-gray-500">Search result snippets (150-160 chars)</p>
				</div>
				<div class="rounded-lg bg-white p-4">
					<h3 class="font-medium text-gray-900">Open Graph</h3>
					<p class="mt-1 text-sm text-gray-500">Controls how pages look when shared on social media</p>
				</div>
			</div>
		</div>
	{/if}
</div>
