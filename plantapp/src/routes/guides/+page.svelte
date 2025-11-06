<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;

	const categories = [
		{ name: 'Getting Started', slug: 'getting-started', icon: '🌱' },
		{ name: 'System Setup', slug: 'system-setup', icon: '🔧' },
		{ name: 'Maintenance', slug: 'maintenance', icon: '⚙️' },
		{ name: 'Troubleshooting', slug: 'troubleshooting', icon: '🔍' },
		{ name: 'Seasonal Planning', slug: 'seasonal-planning', icon: '📅' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Growing Guides</h1>
			<p class="text-lg text-base-content/70">
				Comprehensive step-by-step guides to help you succeed in sustainable agriculture, from
				setup to harvest.
			</p>
		</div>

		<!-- Category Cards -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each categories as category}
				<a href="/guides?category={category.slug}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
					<div class="card-body items-center text-center">
						<span class="text-6xl mb-4">{category.icon}</span>
						<h2 class="card-title">{category.name}</h2>
					</div>
				</a>
			{/each}
		</Grid>

		<!-- Guides List -->
		<div class="space-y-6">
			{#if data.guides && data.guides.length > 0}
				{#each data.guides as guide}
					<div class="card bg-base-100 shadow-lg">
						<div class="card-body">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<h3 class="card-title text-2xl mb-2">
										<a href="/guides/{guide.slug}" class="hover:text-primary transition-colors">
											{guide.title}
										</a>
									</h3>
									<p class="text-base-content/70 mb-4">{guide.excerpt}</p>
									<div class="flex gap-2">
										{#if guide.tags}
											{#each guide.tags as tag}
												<span class="badge badge-outline">{tag}</span>
											{/each}
										{/if}
									</div>
								</div>
								<a href="/guides/{guide.slug}" class="btn btn-primary btn-sm">
									Read Guide
								</a>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="text-center py-12">
					<p class="text-xl text-base-content/70">No guides available. Check back soon!</p>
				</div>
			{/if}
		</div>
	</Container>
</Section>
