<script lang="ts">
	import { Container, Section } from '$lib/components/layout';
	import { Grid } from '$lib/components/layout';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Section>
	<Container>
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-2">Marketing Materials</h1>
			<p class="text-lg text-base-content/70">
				Download banners, get social media templates, and access brand guidelines for promoting
				products.
			</p>
		</div>

		<!-- Banners & Graphics -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6">Banners & Graphics</h2>
			<Grid columns={2} gap={6}>
				{#each data.banners as banner}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title">{banner.title}</h3>
							<div class="flex gap-2 text-sm text-base-content/70">
								<span class="badge badge-outline">{banner.size}</span>
								<span class="badge badge-outline">{banner.format}</span>
							</div>
							<div class="card-actions justify-end mt-4">
								<button class="btn btn-primary btn-sm">
									<span class="mr-2">⬇️</span>
									Download
								</button>
							</div>
						</div>
					</div>
				{/each}
			</Grid>
		</div>

		<!-- Social Media Templates -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6">Social Media Templates</h2>
			<div class="space-y-4">
				{#each data.socialPosts as post}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h3 class="card-title text-lg">{post.platform}</h3>
									<p class="text-base-content/80 my-4">{post.text}</p>
									<p class="text-sm text-primary">{post.hashtags}</p>
								</div>
								<button
									class="btn btn-outline btn-sm"
									onclick={() => navigator.clipboard.writeText(`${post.text}\n\n${post.hashtags}`)}
								>
									📋 Copy
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Email Templates -->
		<div class="mb-12">
			<h2 class="text-2xl font-bold mb-6">Email Templates</h2>
			<div class="space-y-4">
				{#each data.emailTemplates as template}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<h3 class="card-title">{template.title}</h3>
							<p class="text-sm text-base-content/70">Subject: {template.subject}</p>
							<p class="text-base-content/80 my-2">{template.preview}</p>
							<div class="card-actions justify-end">
								<button class="btn btn-outline btn-sm">View Template</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Brand Guidelines -->
		<div>
			<h2 class="text-2xl font-bold mb-6">Brand Guidelines</h2>
			<div class="grid md:grid-cols-2 gap-6">
				<!-- Colors -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title">Brand Colors</h3>
						<div class="space-y-3 mt-4">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg"
									style="background-color: {data.guidelines.colors.primary}"
								></div>
								<div>
									<p class="font-semibold">Primary</p>
									<p class="text-sm text-base-content/70">{data.guidelines.colors.primary}</p>
								</div>
							</div>
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg"
									style="background-color: {data.guidelines.colors.secondary}"
								></div>
								<div>
									<p class="font-semibold">Secondary</p>
									<p class="text-sm text-base-content/70">{data.guidelines.colors.secondary}</p>
								</div>
							</div>
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg"
									style="background-color: {data.guidelines.colors.accent}"
								></div>
								<div>
									<p class="font-semibold">Accent</p>
									<p class="text-sm text-base-content/70">{data.guidelines.colors.accent}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Best Practices -->
				<div class="card bg-base-100 shadow-xl">
					<div class="card-body">
						<h3 class="card-title">Best Practices</h3>
						<div class="mt-4">
							<h4 class="font-semibold text-success mb-2">✅ Do's</h4>
							<ul class="list-disc list-inside space-y-1 text-sm mb-4">
								{#each data.guidelines.dos as guideline}
									<li>{guideline}</li>
								{/each}
							</ul>
							<h4 class="font-semibold text-error mb-2">❌ Don'ts</h4>
							<ul class="list-disc list-inside space-y-1 text-sm">
								{#each data.guidelines.donts as guideline}
									<li>{guideline}</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</Section>
