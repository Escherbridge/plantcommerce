<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'in_progress' | 'completed' | 'all'>('in_progress');

	const enrollments = $derived(data.enrollments ?? []);
	const stats = $derived(data.stats);

	const filteredEnrollments = $derived(
		enrollments.filter((e: any) => {
			if (activeTab === 'all') return true;
			if (activeTab === 'completed') return e.status === 'completed';
			return e.status === 'active' && (e.progressPercent ?? 0) < 100;
		})
	);

	function formatDate(d: string | Date | null): string {
		if (!d) return '';
		return new Date(d).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Learning | Aevani</title>
	<meta
		name="description"
		content="Track your course progress, view enrolled courses, and continue learning."
	/>
</svelte:head>

<!-- Hero -->
<section class="w-full bg-primary py-16 text-primary-content lg:py-24">
	<Container>
		<div class="space-y-4">
			<span class="text-editorial font-mono tracking-widest text-secondary">YOUR JOURNEY</span>
			<h1 class="font-display text-4xl font-bold tracking-tight uppercase lg:text-6xl">
				My Learning
			</h1>
			<p class="max-w-2xl text-lg font-light text-primary-content/70">
				Track your progress, pick up where you left off, and celebrate your achievements.
			</p>
		</div>
	</Container>
</section>

<!-- Stats -->
<section class="w-full border-b border-base-200/50 bg-base-100 py-12 lg:py-16">
	<Container>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="mb-2 flex items-start justify-between">
					<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
						>ENROLLED</span
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-primary/40"
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
				<div class="font-display text-3xl font-bold lg:text-4xl">{stats?.coursesEnrolled ?? 0}</div>
				<p class="mt-1 text-xs text-base-content/50">Total courses</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="mb-2 flex items-start justify-between">
					<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
						>COMPLETED</span
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-success/60"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div class="font-display text-3xl font-bold lg:text-4xl">
					{stats?.coursesCompleted ?? 0}
				</div>
				<p class="mt-1 text-xs text-base-content/50">Finished</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="mb-2 flex items-start justify-between">
					<span class="text-editorial font-mono text-xs tracking-widest text-secondary">STREAK</span
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-warning/70"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.317 17.627 8.75 18 10.332 18 12a8 8 0 01-.343 6.657z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
						/>
					</svg>
				</div>
				<div class="font-display text-3xl font-bold lg:text-4xl">{stats?.currentStreak ?? 0}</div>
				<p class="mt-1 text-xs text-base-content/50">
					{(stats?.currentStreak ?? 0) === 1 ? 'Day' : 'Days'}
				</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="mb-2 flex items-start justify-between">
					<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
						>QUIZ SCORE</span
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-info/60"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<div class="font-display text-3xl font-bold lg:text-4xl">
					{stats?.averageQuizScore ?? 0}%
				</div>
				<p class="mt-1 text-xs text-base-content/50">Average</p>
			</div>
		</div>
	</Container>
</section>

<!-- Courses -->
<section class="w-full bg-base-100 py-12 lg:py-16">
	<Container>
		<!-- Tabs -->
		<div class="mb-8 flex items-center gap-2 overflow-x-auto border-b border-base-200/50">
			{#each [{ id: 'in_progress', label: 'In Progress' }, { id: 'completed', label: 'Completed' }, { id: 'all', label: 'All' }] as tab}
				<button
					type="button"
					class="font-display border-b-2 px-5 py-3 text-sm tracking-wider whitespace-nowrap uppercase transition-colors {activeTab ===
					tab.id
						? 'border-primary text-primary'
						: 'border-transparent text-base-content/50 hover:text-base-content'}"
					onclick={() => (activeTab = tab.id as any)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if filteredEnrollments.length === 0}
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-16 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mx-auto mb-4 h-16 w-16 text-base-content/30"
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
				<h3 class="font-display mb-2 text-2xl font-bold tracking-tight uppercase">
					{#if enrollments.length === 0}
						Start Your Learning Journey
					{:else if activeTab === 'completed'}
						No Completed Courses Yet
					{:else}
						No Courses In Progress
					{/if}
				</h3>
				<p class="mx-auto mb-6 max-w-md font-light text-base-content/60">
					{#if enrollments.length === 0}
						Browse our catalog and enroll in courses to build your skills.
					{:else}
						Pick a new course to continue building your skills.
					{/if}
				</p>
				<a
					href="/courses"
					class="font-display btn rounded-2xl tracking-wider uppercase btn-primary"
				>
					Browse Courses
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{#each filteredEnrollments as enrollment}
					<div
						class="group flex flex-col overflow-hidden rounded-3xl border border-base-200/30 bg-base-100 shadow-md transition-all duration-300 hover:border-primary/20 hover:shadow-xl"
					>
						<div
							class="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10"
						>
							{#if enrollment.course?.thumbnailFileId}
								<img
									src="/api/files/serve/{enrollment.course.thumbnailFileId}"
									alt={enrollment.course.title}
									class="h-full w-full object-cover"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-16 w-16 text-primary/30"
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
							{#if enrollment.status === 'completed'}
								<div class="absolute top-4 right-4">
									<span class="badge font-mono text-xs tracking-wider uppercase badge-success"
										>Completed</span
									>
								</div>
							{/if}
						</div>

						<div class="flex flex-1 flex-col p-6">
							<h3 class="font-display mb-2 line-clamp-2 text-lg font-bold tracking-tight uppercase">
								{enrollment.course?.title ?? 'Untitled Course'}
							</h3>
							{#if enrollment.course?.instructorName}
								<p class="mb-4 font-mono text-xs tracking-wider text-base-content/50 uppercase">
									By {enrollment.course.instructorName}
								</p>
							{/if}

							<!-- Progress bar -->
							<div class="mb-4 flex-1">
								<div class="mb-2 flex items-center justify-between">
									<span class="font-mono text-xs tracking-wider text-base-content/60 uppercase"
										>Progress</span
									>
									<span class="font-mono text-xs font-bold">{enrollment.progressPercent ?? 0}%</span
									>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-base-200">
									<div
										class="h-full bg-primary transition-all duration-300"
										style="width: {enrollment.progressPercent ?? 0}%"
									></div>
								</div>
							</div>

							{#if enrollment.lastAccessedAt}
								<p class="mb-4 font-mono text-xs text-base-content/40">
									Last viewed {formatDate(enrollment.lastAccessedAt)}
								</p>
							{/if}

							<a
								href="/learn/course/{enrollment.course?.slug}"
								class="font-display btn w-full rounded-2xl tracking-wider uppercase btn-sm btn-primary"
							>
								{enrollment.status === 'completed'
									? 'Review'
									: (enrollment.progressPercent ?? 0) > 0
										? 'Continue'
										: 'Start'}
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Container>
</section>
