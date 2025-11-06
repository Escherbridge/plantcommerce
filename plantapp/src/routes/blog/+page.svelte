<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;

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
			<h1 class="text-4xl font-bold mb-4">Blog</h1>
			<p class="text-lg text-base-content/70">
				Stay updated with the latest news, insights, and stories from the sustainable agriculture
				community.
			</p>
		</div>

		<!-- Category Filter -->
		<div class="flex flex-wrap gap-2 mb-8">
			<a href="/blog" class="btn btn-sm {!data.selectedCategory ? 'btn-primary' : 'btn-outline'}">
				All Posts
			</a>
			{#each categories as category}
				<a
					href="/blog?category={category.slug}"
					class="btn btn-sm {data.selectedCategory === category.slug ? 'btn-primary' : 'btn-outline'}"
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
						{#if post.featuredImage}
							<figure class="aspect-video">
								<img
									src={post.featuredImage}
									alt={post.title}
									class="object-cover w-full h-full"
								/>
							</figure>
						{/if}
						<div class="card-body">
							<div class="text-sm text-base-content/60 mb-2">
								{new Date(post.publishedAt).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</div>
							<h2 class="card-title">
								<a href="/blog/{post.slug}" class="hover:text-primary transition-colors">
									{post.title}
								</a>
							</h2>
							<p class="text-base-content/70">{post.excerpt}</p>
							<div class="card-actions justify-between items-center mt-4">
								<div class="flex gap-2">
									{#if post.tags}
										{#each post.tags.slice(0, 2) as tag}
											<span class="badge badge-sm badge-outline">{tag}</span>
										{/each}
									{/if}
								</div>
								<a href="/blog/{post.slug}" class="btn btn-sm btn-primary">Read More</a>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<div class="col-span-2 text-center py-12">
					<p class="text-xl text-base-content/70">No blog posts available. Check back soon!</p>
				</div>
			{/if}
		</Grid>
	</Container>
</Section>
