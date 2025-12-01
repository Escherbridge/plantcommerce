<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const resourceTypes = [
		{ name: 'Downloadable Guides', icon: '📄', slug: 'guides' },
		{ name: 'Video Tutorials', icon: '🎥', slug: 'videos' },
		{ name: 'Webinars', icon: '🎓', slug: 'webinars' },
		{ name: 'Research Papers', icon: '📚', slug: 'research' },
		{ name: 'Community Forums', icon: '💬', slug: 'forums' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Resources</h1>
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
					class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
				>
					<div class="card-body items-center text-center">
						<span class="text-6xl mb-4">{type.icon}</span>
						<h2 class="card-title">{type.name}</h2>
					</div>
				</a>
			{/each}
		</Grid>

		<!-- Resources List -->
		<div class="space-y-6">
			{#if data.resources && data.resources.length > 0}
				{#each data.resources as resource}
					<div class="card bg-base-100 shadow-lg">
						<div class="card-body">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<div class="badge badge-primary mb-2">{resource.type}</div>
									<h3 class="card-title text-2xl mb-2">{resource.title}</h3>
									<p class="text-base-content/70 mb-4">{resource.description}</p>
									{#if resource.fileSize}
										<p class="text-sm text-base-content/50">Size: {resource.fileSize}</p>
									{/if}
								</div>
								<div class="flex flex-col gap-2">
									{#if resource.downloadUrl}
										<a
											href={resource.downloadUrl}
											download
											class="btn btn-primary btn-sm"
										>
											Download
										</a>
									{/if}
									{#if resource.viewUrl}
										<a
											href={resource.viewUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="btn btn-outline btn-sm"
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
