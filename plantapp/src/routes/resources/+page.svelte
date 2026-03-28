<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const resourceTypes = [
		{ name: 'Downloadable Guides', icon: 'book', slug: 'guides' },
		{ name: 'Video Tutorials', icon: 'video', slug: 'videos' },
		{ name: 'Webinars', icon: 'graduation', slug: 'webinars' },
		{ name: 'Research Papers', icon: 'search', slug: 'research' },
		{ name: 'Community Forums', icon: 'chat', slug: 'forums' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-display uppercase tracking-tight mb-4">Resources</h1>
			<p class="text-lg text-base-content/70">
				Access our comprehensive library of educational materials, tools, and community resources
				for sustainable agriculture.
			</p>
		</div>

		<!-- Resource Type Cards -->
		<Grid columns={3} gap={6} class="mb-12">
			{#each resourceTypes as type}
				<a
					href="/resources?type={type.slug}"
					class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md hover:shadow-lg transition-shadow"
				>
					<div class="card-body items-center text-center">
						<div class="mb-4">
							{#if type.icon === 'book'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-12 h-12 text-primary">
									<path d="M4 4h6a2 2 0 012 2v14a1 1 0 00-1-1H4V4zM20 4h-6a2 2 0 00-2 2v14a1 1 0 011-1h7V4z"/>
								</svg>
							{:else if type.icon === 'video'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-12 h-12 text-primary">
									<path d="M15 10l5-3v10l-5-3M3 5h12v14H3V5z"/>
								</svg>
							{:else if type.icon === 'graduation'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-12 h-12 text-primary">
									<path d="M2 10l10-5 10 5-10 5-10-5zM6 12v5l6 3 6-3v-5"/>
								</svg>
							{:else if type.icon === 'search'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-12 h-12 text-primary">
									<path d="M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3"/>
								</svg>
							{:else if type.icon === 'chat'}
								<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" class="w-12 h-12 text-primary">
									<path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z"/>
								</svg>
							{/if}
						</div>
						<p class="font-mono text-xs uppercase tracking-widest text-secondary mb-1">Resource</p>
						<h2 class="card-title font-display uppercase tracking-tight">{type.name}</h2>
					</div>
				</a>
			{/each}
		</Grid>

		<!-- Resources List -->
		<div class="space-y-6">
			{#if data.resources && data.resources.length > 0}
				{#each data.resources as resource}
					<div class="card bg-base-100 rounded-3xl border border-base-200/30 shadow-md">
						<div class="card-body">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<div class="badge badge-primary mb-2 font-mono text-xs uppercase tracking-widest">{resource.type}</div>
									<h3 class="card-title font-display uppercase tracking-tight text-2xl mb-2">{resource.title}</h3>
									<p class="text-base-content/70 mb-4">{resource.description}</p>
									{#if resource.fileSize}
										<p class="font-mono text-xs uppercase tracking-widest text-secondary">Size: {resource.fileSize}</p>
									{/if}
								</div>
								<div class="flex flex-col gap-2">
									{#if resource.downloadUrl}
										<a
											href={resource.downloadUrl}
											download
											class="btn btn-primary btn-sm font-display uppercase tracking-wider"
										>
											Download
										</a>
									{/if}
									{#if resource.viewUrl}
										<a
											href={resource.viewUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="btn btn-outline btn-sm font-display uppercase tracking-wider"
										>
											View
										</a>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="text-center py-12">
					<p class="text-xl text-base-content/70">
						No resources available. Check back soon for new materials!
					</p>
				</div>
			{/if}
		</div>
	</Container>
</Section>
