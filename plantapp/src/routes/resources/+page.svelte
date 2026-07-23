<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import { Icon, type IconName } from '$lib/components/icons';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const resourceTypes: Array<{ name: string; slug: string; icon: IconName }> = [
		{ name: 'Downloadable Guides', icon: 'book-open', slug: 'guides' },
		{ name: 'Video Tutorials', icon: 'video', slug: 'videos' },
		{ name: 'Webinars', icon: 'graduation-cap', slug: 'webinars' },
		{ name: 'Research Papers', icon: 'search', slug: 'research' },
		{ name: 'Community Forums', icon: 'message-circle', slug: 'forums' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="font-display mb-4 text-4xl tracking-tight uppercase">Resources</h1>
			<p class="text-lg text-base-content/70">
				Access our comprehensive library of educational materials, tools, and community resources
				for sustainable agriculture.
			</p>
		</div>

		<!-- Resource Type Cards -->
		<Grid columns={{ sm: 1, md: 2, xl: 5 }} gap="md" class="editorial-category-grid mb-12">
			{#each resourceTypes as type, index}
				<a
					href="/resources?type={type.slug}"
					class="group flex min-h-52 w-full flex-col border border-base-content/30 bg-base-100 p-5 text-left transition-colors hover:border-primary hover:bg-base-200/60"
					class:border-primary={data.selectedType === type.slug}
					class:bg-base-200={data.selectedType === type.slug}
					aria-current={data.selectedType === type.slug ? 'page' : undefined}
				>
					<div class="mb-8 flex items-start justify-between gap-4">
						<span class="text-lime-ink font-mono text-xs font-semibold tracking-widest">
							0{index + 1}
						</span>
						<span
							class="flex h-12 w-12 items-center justify-center border border-primary bg-accent text-accent-content"
						>
							<Icon name={type.icon} size={32} />
						</span>
					</div>
					<p class="text-lime-ink mb-2 font-mono text-xs font-semibold tracking-widest uppercase">
						{data.selectedType === type.slug ? 'Selected resource' : 'Resource'}
					</p>
					<h2
						class="font-display mt-auto text-xl leading-tight font-semibold tracking-tight uppercase"
					>
						{type.name}
					</h2>
				</a>
			{/each}
		</Grid>

		<!-- Resources List -->
		<div class="space-y-6">
			{#if data.loadStatus === 'error'}
				<div class="border border-error bg-base-100 p-6" role="alert">
					<h2 class="font-display text-2xl font-semibold uppercase">
						Resources could not be loaded
					</h2>
					<p class="mt-2 text-base-content/75">Please try again later or contact support.</p>
				</div>
			{:else if data.resources && data.resources.length > 0}
				{#each data.resources as resource}
					<div class="card rounded-3xl border border-base-200/30 bg-base-100 shadow-md">
						<div class="card-body">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-2 badge font-mono text-xs tracking-widest uppercase badge-primary">
										{resource.type}
									</div>
									<h3 class="font-display mb-2 card-title text-2xl tracking-tight uppercase">
										{resource.title}
									</h3>
									<p class="mb-4 text-base-content/70">
										{resource.excerpt ?? 'No summary is available yet.'}
									</p>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="py-12 text-center">
					<p class="text-xl text-base-content/70">
						No resources available. Check back soon for new materials!
					</p>
				</div>
			{/if}
		</div>
	</Container>
</Section>
