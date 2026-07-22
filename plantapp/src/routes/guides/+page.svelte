<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = [
		{ name: 'Getting Started', slug: 'getting-started', icon: 'seedling' },
		{ name: 'System Setup', slug: 'system-setup', icon: 'wrench' },
		{ name: 'Maintenance', slug: 'maintenance', icon: 'tools' },
		{ name: 'Troubleshooting', slug: 'troubleshooting', icon: 'search' },
		{ name: 'Seasonal Planning', slug: 'seasonal-planning', icon: 'calendar' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="font-display mb-4 text-4xl tracking-tight uppercase">Growing Guides</h1>
			<p class="text-lg text-base-content/70">
				Comprehensive step-by-step guides to help you succeed in sustainable agriculture, from setup
				to harvest.
			</p>
		</div>

		<!-- Category Cards -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each categories as category}
				<a
					href="/guides?category={category.slug}"
					class="card rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-shadow hover:shadow-lg"
				>
					<div class="card-body items-center text-center">
						<div class="mb-4">
							{#if category.icon === 'seedling'}
								<svg
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									fill="none"
									class="h-12 w-12 text-primary"
								>
									<path d="M12 3c-4 4-8 9-8 14 0 3 2 5 5 5s5-2 5-5c0-5-4-10-8-14zM12 3v18" />
								</svg>
							{:else if category.icon === 'wrench'}
								<svg
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									fill="none"
									class="h-12 w-12 text-primary"
								>
									<path
										d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.6-3.6a5 5 0 01-7.1 7.1L6 21l-3-3 8.2-8.2a5 5 0 017.1-7.1z"
									/>
								</svg>
							{:else if category.icon === 'tools'}
								<svg
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									fill="none"
									class="h-12 w-12 text-primary"
								>
									<path
										d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.6-3.6a5 5 0 01-7.1 7.1L6 21l-3-3 8.2-8.2a5 5 0 017.1-7.1z"
									/>
								</svg>
							{:else if category.icon === 'search'}
								<svg
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									fill="none"
									class="h-12 w-12 text-primary"
								>
									<path d="M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3" />
								</svg>
							{:else if category.icon === 'calendar'}
								<svg
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									fill="none"
									class="h-12 w-12 text-primary"
								>
									<path d="M4 5h16v16H4V5zM16 3v4M8 3v4M4 9h16" />
								</svg>
							{/if}
						</div>
						<p class="mb-1 font-mono text-xs tracking-widest text-secondary uppercase">Category</p>
						<h2 class="font-display card-title tracking-tight uppercase">{category.name}</h2>
					</div>
				</a>
			{/each}
		</Grid>

		<!-- Guides List -->
		<div class="space-y-6">
			{#if data.guides && data.guides.length > 0}
				{#each data.guides as guide}
					<div class="card rounded-3xl border border-base-200/30 bg-base-100 shadow-md">
						<div class="card-body">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h3 class="font-display mb-2 card-title text-2xl tracking-tight uppercase">
										<a href="/guides/{guide.slug}" class="transition-colors hover:text-primary">
											{guide.title}
										</a>
									</h3>
									<p class="mb-4 text-base-content/70">
										{guide.excerpt ?? 'No summary is available yet.'}
									</p>
								</div>
								<a
									href="/guides/{guide.slug}"
									class="font-display btn tracking-wider uppercase btn-sm btn-primary"
								>
									Read Guide
								</a>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="py-12 text-center">
					<p class="text-xl text-base-content/70">No guides available. Check back soon!</p>
				</div>
			{/if}
		</div>
	</Container>
</Section>
