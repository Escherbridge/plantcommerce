<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = [
		{ name: 'Industry News', slug: 'industry-news' },
		{ name: 'Success Stories', slug: 'success-stories' },
		{ name: 'Technical Articles', slug: 'technical' },
		{ name: 'Research Updates', slug: 'research' },
		{ name: 'Community Features', slug: 'community' }
	];
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="mb-4 text-4xl font-bold">Blog</h1>
			<p class="text-lg text-base-content/70">
				Stay updated with the latest news, insights, and stories from the sustainable agriculture
				community.
			</p>
		</div>

		<!-- Category Filter -->
		<div class="mb-8 flex flex-wrap gap-2">
			<a href="/blog" class="btn btn-sm {!data.selectedCategory ? 'btn-primary' : 'btn-outline'}">
				All Posts
			</a>
			{#each categories as category}
				<a
					href="/blog?category={category.slug}"
					class="btn btn-sm {data.selectedCategory === category.slug
						? 'btn-primary'
						: 'btn-outline'}"
				>
					{category.name}
				</a>
			{/each}
		</div>

		<!-- Blog Posts Grid -->
		<Grid columns={2} gap={6}>
			{#if data.posts && data.posts.length > 0}
				{#each data.posts as post}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-2 text-sm text-base-content/60">
								{post.publishedAt
									? new Date(post.publishedAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})
									: 'Publication date unavailable'}
							</div>
							<h2 class="card-title">
								<a href="/blog/{post.slug}" class="transition-colors hover:text-primary">
									{post.title}
								</a>
							</h2>
							<p class="text-base-content/70">{post.excerpt ?? 'No summary is available yet.'}</p>
							<div class="mt-4 card-actions items-center justify-between">
								<a href="/blog/{post.slug}" class="btn btn-sm btn-primary">Read More</a>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="col-span-2 py-12 text-center">
					<p class="text-xl text-base-content/70">No blog posts available. Check back soon!</p>
				</div>
			{/if}
		</Grid>
	</Container>
</Section>
