<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import { Icon, type IconName } from '$lib/components/icons';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories: Array<{ name: string; slug: string; icon: IconName }> = [
		{ name: 'Getting Started', slug: 'getting-started', icon: 'sprout' },
		{ name: 'System Setup', slug: 'system-setup', icon: 'wrench' },
		{ name: 'Maintenance', slug: 'maintenance', icon: 'maintenance' },
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
		<Grid columns={{ sm: 1, md: 2, xl: 5 }} gap="md" class="editorial-category-grid mb-12">
			{#each categories as category, index}
				<a
					href="/guides?category={category.slug}"
					class="group flex min-h-52 w-full flex-col border border-base-content/30 bg-base-100 p-5 text-left transition-colors hover:border-primary hover:bg-base-200/60"
					class:border-primary={data.selectedCategory === category.slug}
					class:bg-base-200={data.selectedCategory === category.slug}
					aria-current={data.selectedCategory === category.slug ? 'page' : undefined}
				>
					<div class="mb-8 flex items-start justify-between gap-4">
						<span class="text-lime-ink font-mono text-xs font-semibold tracking-widest">
							0{index + 1}
						</span>
						<span
							class="flex h-12 w-12 items-center justify-center border border-primary bg-accent text-accent-content"
						>
							<Icon name={category.icon} size={32} />
						</span>
					</div>
					<p class="text-lime-ink mb-2 font-mono text-xs font-semibold tracking-widest uppercase">
						{data.selectedCategory === category.slug ? 'Selected category' : 'Category'}
					</p>
					<h2
						class="font-display mt-auto text-xl leading-tight font-semibold tracking-tight uppercase"
					>
						{category.name}
					</h2>
				</a>
			{/each}
		</Grid>

		<!-- Guides List -->
		<div class="space-y-6">
			{#if data.loadStatus === 'error'}
				<div class="border border-error bg-base-100 p-6" role="alert">
					<h2 class="font-display text-2xl font-semibold uppercase">Guides could not be loaded</h2>
					<p class="mt-2 text-base-content/75">Please try again later or contact support.</p>
				</div>
			{:else if data.guides && data.guides.length > 0}
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
