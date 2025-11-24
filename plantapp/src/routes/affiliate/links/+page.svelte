<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';

	let { data }: { data: PageData } = $props();

	let selectedProduct: any = $state(null);
	let generatedLink = $state('');
	let customSlug = $state('');

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

	function copyLink(link: string) {
		navigator.clipboard.writeText(link);
		// Could add toast notification here
	}
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">Affiliate Links</h1>
			<p class="text-lg text-base-content/70">
				Generate and manage your affiliate links for products. Track performance and optimize your
				campaigns.
			</p>
		</div>

		<!-- Link Generator -->
		<div class="card bg-base-100 shadow-xl mb-12">
			<div class="card-body">
				<h2 class="card-title mb-4">Generate New Link</h2>

				<div class="grid md:grid-cols-2 gap-6">
					<!-- Product Selection -->
					<div class="form-control">
						<label class="label" for="product-select">
							<span class="label-text">Select Product</span>
						</label>
						<select
							id="product-select"
							class="select select-bordered"
							bind:value={selectedProduct}
						>
							<option value={null}>Choose a product...</option>
							{#if data.products}
								{#each data.products as product}
									<option value={product}>{product.name}</option>
								{/each}
							{/if}
						</select>
					</div>

					<!-- Custom Slug (Optional) -->
					<div class="form-control">
						<label class="label" for="custom-slug">
							<span class="label-text">Custom Identifier (Optional)</span>
						</label>
						<input
							id="custom-slug"
							type="text"
							placeholder="e.g., summer-promo"
							class="input input-bordered"
							bind:value={customSlug}
						/>
					</div>
				</div>

				<button class="btn btn-primary mt-4" onclick={generateLink} disabled={!selectedProduct}>
					Generate Link
				</button>

				{#if generatedLink}
					<div class="mt-6 p-4 bg-base-200 rounded-lg">
						<div class="label">
							<span class="label-text font-semibold">Your Affiliate Link</span>
						</div>
						<div class="flex gap-2">
							<input
								type="text"
								value={generatedLink}
								readonly
								class="input input-bordered flex-1 font-mono text-sm"
							/>
							<button class="btn btn-square" onclick={() => copyLink(generatedLink)}>
								📋
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Existing Links -->
		<div>
			<h2 class="text-2xl font-bold mb-4">Your Links</h2>
			{#if data.links && data.links.length > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Product</th>
								<th>Link</th>
								<th>Clicks</th>
								<th>Conversions</th>
								<th>Earnings</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each data.links as link}
								<tr>
									<td>
										<div class="font-semibold">{link.product?.name || 'N/A'}</div>
										{#if link.customSlug}
											<div class="text-xs text-base-content/60">{link.customSlug}</div>
										{/if}
									</td>
									<td>
										<div class="font-mono text-xs max-w-xs truncate">
											{link.url}
										</div>
									</td>
									<td>
										<span class="badge badge-primary">{link.clicks || 0}</span>
									</td>
									<td>
										<span class="badge badge-secondary">{link.conversions || 0}</span>
									</td>
									<td class="font-semibold text-success">
										${link.earnings ? parseFloat(link.earnings).toFixed(2) : '0.00'}
									</td>
									<td>
										<div class="flex gap-2">
											<button
												class="btn btn-xs btn-outline"
												onclick={() => copyLink(link.url)}
											>
												Copy
											</button>
											<a href="/affiliate/links/{link.id}" class="btn btn-xs btn-outline">
												Stats
											</a>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center py-12 bg-base-200 rounded-lg">
					<p class="text-xl text-base-content/70 mb-4">No links generated yet.</p>
					<p class="text-base-content/60">Create your first affiliate link above to get started!</p>
				</div>
			{/if}
		</div>

		<!-- Link Best Practices -->
		<div class="mt-12 card bg-base-200">
			<div class="card-body">
				<h3 class="card-title">Link Best Practices</h3>
				<ul class="list-disc list-inside space-y-2 text-base-content/70">
					<li>Use custom identifiers to track different campaigns or platforms</li>
					<li>Test your links before sharing to ensure they work correctly</li>
					<li>Disclose affiliate relationships according to FTC guidelines</li>
					<li>Track performance regularly to optimize your promotion strategy</li>
					<li>Use deep links to specific products for better conversion rates</li>
				</ul>
			</div>
		</div>
	</Container>
</Section>
