<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let difficultyFilter = $state<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
	let pricingFilter = $state<'all' | 'free' | 'one_time'>('all');

	const filteredCourses = $derived(
		(data.courses ?? []).filter((c: any) => {
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				if (!c.title?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) {
					return false;
				}
			}
			if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;
			if (pricingFilter !== 'all' && c.pricingType !== pricingFilter) return false;
			return true;
		})
	);

	function difficultyBadgeClass(level: string | null): string {
		if (level === 'beginner') return 'badge-success';
		if (level === 'intermediate') return 'badge-warning';
		if (level === 'advanced') return 'badge-error';
		return 'badge-ghost';
	}

	function formatPrice(price: string | null, type: string | null): string {
		if (type === 'free' || !price || price === '0' || price === '0.00') return 'Free';
		return `$${price}`;
	}
</script>

<svelte:head>
	<title>Course Catalog | Aevani</title>
	<meta
		name="description"
		content="Browse our full catalog of courses on sustainable agriculture, hydroponics, aquaponics, and regenerative farming."
	/>
</svelte:head>

<!-- Hero -->
<section class="bg-primary text-primary-content w-full py-24 lg:py-32">
	<Container>
		<div class="text-center space-y-6">
			<span class="text-editorial text-secondary font-mono tracking-widest">LEARN BY DOING</span>
			<h1 class="text-display font-display uppercase tracking-tight">Course Catalog</h1>
			<p class="text-xl text-primary-content/70 max-w-3xl mx-auto font-light leading-relaxed">
				Hands-on courses taught by experts in sustainable agriculture and regenerative farming
			</p>
		</div>
	</Container>
</section>

<section class="bg-base-100 w-full py-16 lg:py-24">
	<Container>
		<!-- Filters -->
		<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 lg:p-8 shadow-sm mb-12">
			<div class="flex flex-col lg:flex-row gap-4 lg:items-center">
				<div class="flex-1">
					<label for="course-search" class="sr-only">Search courses</label>
					<div class="relative">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
						</svg>
						<input
							id="course-search"
							type="text"
							bind:value={searchQuery}
							placeholder="Search courses..."
							class="input input-bordered w-full pl-12 rounded-2xl"
						/>
					</div>
				</div>
				<div class="flex flex-wrap gap-3">
					<select bind:value={difficultyFilter} class="select select-bordered rounded-2xl">
						<option value="all">All Levels</option>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
					</select>
					<select bind:value={pricingFilter} class="select select-bordered rounded-2xl">
						<option value="all">All Pricing</option>
						<option value="free">Free</option>
						<option value="one_time">Paid</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Results -->
		{#if filteredCourses.length === 0}
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-16 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-16 h-16 mx-auto text-base-content/30 mb-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				<h3 class="font-display text-2xl font-bold uppercase tracking-tight mb-2">No Courses Found</h3>
				<p class="text-base-content/60 font-light">
					{data.courses && data.courses.length > 0
						? 'Try adjusting your search or filters.'
						: 'Check back soon as we publish new courses.'}
				</p>
			</div>
		{:else}
			<div class="mb-6 flex justify-between items-end">
				<span class="text-sm font-mono text-base-content/60 tracking-widest uppercase">
					{filteredCourses.length} {filteredCourses.length === 1 ? 'COURSE' : 'COURSES'}
				</span>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{#each filteredCourses as course}
					<a
						href="/courses/{course.slug}"
						class="group rounded-3xl bg-base-100 border border-base-200/30 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col"
					>
						<!-- Thumbnail -->
						<div class="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
							{#if course.thumbnailFileId}
								<img
									src="/api/files/serve/{course.thumbnailFileId}"
									alt={course.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-16 h-16 text-primary/30"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
								</div>
							{/if}
						</div>

						<div class="p-6 lg:p-7 flex-1 flex flex-col">
							<div class="flex items-center gap-2 mb-3">
								{#if course.difficulty}
									<span class="badge {difficultyBadgeClass(course.difficulty)} badge-sm uppercase font-mono tracking-wider">
										{course.difficulty}
									</span>
								{/if}
								{#if course.isFeatured}
									<span class="badge badge-primary badge-sm uppercase font-mono tracking-wider">Featured</span>
								{/if}
							</div>

							<h3 class="font-display text-xl lg:text-2xl font-bold uppercase tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
								{course.title}
							</h3>

							{#if course.instructorName}
								<p class="text-xs font-mono text-base-content/50 tracking-wider uppercase mb-3">
									By {course.instructorName}
								</p>
							{/if}

							{#if course.description}
								<p class="text-sm text-base-content/60 line-clamp-3 font-light leading-relaxed flex-1">
									{course.description}
								</p>
							{/if}

							<div class="mt-5 pt-5 border-t border-base-200/50 flex items-center justify-between">
								<span class="font-display text-lg font-bold text-primary">
									{formatPrice(course.price, course.pricingType)}
								</span>
								<div class="flex items-center gap-2 text-primary text-sm font-medium">
									<span>View</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-4 h-4 transition-transform group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</Container>
</section>
