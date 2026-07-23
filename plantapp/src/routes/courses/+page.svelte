<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';
	import { Icon } from '$lib/components/icons';

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
<section class="w-full bg-primary py-24 text-primary-content lg:py-32">
	<Container>
		<div class="space-y-6 text-center">
			<span class="text-editorial font-mono tracking-widest text-secondary">LEARN BY DOING</span>
			<h1 class="text-display font-display tracking-tight uppercase">Course Catalog</h1>
			<p class="mx-auto max-w-3xl text-xl leading-relaxed font-light text-primary-content/70">
				Hands-on courses taught by experts in sustainable agriculture and regenerative farming
			</p>
		</div>
	</Container>
</section>

<section class="w-full bg-base-100 py-16 lg:py-24">
	<Container>
		<!-- Filters -->
		<div class="mb-12 rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm lg:p-8">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center">
				<div class="flex-1">
					<label for="course-search" class="sr-only">Search courses</label>
					<div class="relative">
						<Icon
							name="search"
							size={20}
							class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base-content/40"
						/>
						<input
							id="course-search"
							type="text"
							bind:value={searchQuery}
							placeholder="Search courses..."
							class="input-bordered input w-full rounded-2xl pl-12"
						/>
					</div>
				</div>
				<div class="flex flex-wrap gap-3">
					<select bind:value={difficultyFilter} class="select-bordered select rounded-2xl">
						<option value="all">All Levels</option>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
					</select>
					<select bind:value={pricingFilter} class="select-bordered select rounded-2xl">
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
				<Icon name="book-open" size={64} class="mx-auto mb-4 text-base-content/30" />
				<h3 class="font-display mb-2 text-2xl font-bold tracking-tight uppercase">
					No Courses Found
				</h3>
				<p class="font-light text-base-content/60">
					{data.courses && data.courses.length > 0
						? 'Try adjusting your search or filters.'
						: 'Check back soon as we publish new courses.'}
				</p>
			</div>
		{:else}
			<div class="mb-6 flex items-end justify-between">
				<span class="font-mono text-sm tracking-widest text-base-content/60 uppercase">
					{filteredCourses.length}
					{filteredCourses.length === 1 ? 'COURSE' : 'COURSES'}
				</span>
			</div>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{#each filteredCourses as course}
					<a
						href="/courses/{course.slug}"
						class="group flex flex-col overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:border-primary/20 hover:shadow-xl"
					>
						<!-- Thumbnail -->
						<div class="relative aspect-video overflow-hidden bg-base-200">
							{#if course.thumbnailFileId}
								<img
									src="/api/files/serve/{course.thumbnailFileId}"
									alt={course.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<Icon name="book-open" size={64} class="text-primary/30" />
								</div>
							{/if}
						</div>

						<div class="flex flex-1 flex-col p-6 lg:p-7">
							<div class="mb-3 flex items-center gap-2">
								{#if course.difficulty}
									<span
										class="badge {difficultyBadgeClass(
											course.difficulty
										)} badge-sm font-mono tracking-wider uppercase"
									>
										{course.difficulty}
									</span>
								{/if}
								{#if course.isFeatured}
									<span class="badge badge-sm font-mono tracking-wider uppercase badge-primary"
										>Featured</span
									>
								{/if}
							</div>

							<h3
								class="font-display mb-2 line-clamp-2 text-xl font-bold tracking-tight uppercase transition-colors group-hover:text-primary lg:text-2xl"
							>
								{course.title}
							</h3>

							{#if course.instructorName}
								<p class="mb-3 font-mono text-xs tracking-wider text-base-content/50 uppercase">
									By {course.instructorName}
								</p>
							{/if}

							{#if course.description}
								<p
									class="line-clamp-3 flex-1 text-sm leading-relaxed font-light text-base-content/60"
								>
									{course.description}
								</p>
							{/if}

							<div class="mt-5 flex items-center justify-between border-t border-base-200/50 pt-5">
								<span class="font-display text-lg font-bold text-primary">
									{formatPrice(course.price, course.pricingType)}
								</span>
								<div class="flex items-center gap-2 text-sm font-medium text-primary">
									<span>View</span>
									<Icon
										name="arrow-right"
										size={16}
										class="transition-transform group-hover:translate-x-1"
									/>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</Container>
</section>
