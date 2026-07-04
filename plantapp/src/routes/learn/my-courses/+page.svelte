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
		return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>My Learning | Aevani</title>
	<meta name="description" content="Track your course progress, view enrolled courses, and continue learning." />
</svelte:head>

<!-- Hero -->
<section class="bg-primary text-primary-content w-full py-16 lg:py-24">
	<Container>
		<div class="space-y-4">
			<span class="text-editorial text-secondary font-mono tracking-widest">YOUR JOURNEY</span>
			<h1 class="font-display text-4xl lg:text-6xl font-bold uppercase tracking-tight">My Learning</h1>
			<p class="text-lg text-primary-content/70 font-light max-w-2xl">
				Track your progress, pick up where you left off, and celebrate your achievements.
			</p>
		</div>
	</Container>
</section>

<!-- Stats -->
<section class="bg-base-100 w-full py-12 lg:py-16 border-b border-base-200/50">
	<Container>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="flex items-start justify-between mb-2">
					<span class="text-editorial text-secondary font-mono text-xs tracking-widest">ENROLLED</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
				</div>
				<div class="font-display text-3xl lg:text-4xl font-bold">{stats?.coursesEnrolled ?? 0}</div>
				<p class="text-xs text-base-content/50 mt-1">Total courses</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="flex items-start justify-between mb-2">
					<span class="text-editorial text-secondary font-mono text-xs tracking-widest">COMPLETED</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-success/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="font-display text-3xl lg:text-4xl font-bold">{stats?.coursesCompleted ?? 0}</div>
				<p class="text-xs text-base-content/50 mt-1">Finished</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="flex items-start justify-between mb-2">
					<span class="text-editorial text-secondary font-mono text-xs tracking-widest">STREAK</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-warning/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.317 17.627 8.75 18 10.332 18 12a8 8 0 01-.343 6.657z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
					</svg>
				</div>
				<div class="font-display text-3xl lg:text-4xl font-bold">{stats?.currentStreak ?? 0}</div>
				<p class="text-xs text-base-content/50 mt-1">{(stats?.currentStreak ?? 0) === 1 ? 'Day' : 'Days'}</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="flex items-start justify-between mb-2">
					<span class="text-editorial text-secondary font-mono text-xs tracking-widest">QUIZ SCORE</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div class="font-display text-3xl lg:text-4xl font-bold">{stats?.averageQuizScore ?? 0}%</div>
				<p class="text-xs text-base-content/50 mt-1">Average</p>
			</div>
		</div>
	</Container>
</section>

<!-- Courses -->
<section class="bg-base-100 w-full py-12 lg:py-16">
	<Container>
		<!-- Tabs -->
		<div class="flex items-center gap-2 mb-8 border-b border-base-200/50 overflow-x-auto">
			{#each [{ id: 'in_progress', label: 'In Progress' }, { id: 'completed', label: 'Completed' }, { id: 'all', label: 'All' }] as tab}
				<button
					type="button"
					class="px-5 py-3 font-display uppercase tracking-wider text-sm border-b-2 transition-colors whitespace-nowrap {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-base-content/50 hover:text-base-content'}"
					onclick={() => (activeTab = tab.id as any)}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if filteredEnrollments.length === 0}
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-16 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
				<h3 class="font-display text-2xl font-bold uppercase tracking-tight mb-2">
					{#if enrollments.length === 0}
						Start Your Learning Journey
					{:else if activeTab === 'completed'}
						No Completed Courses Yet
					{:else}
						No Courses In Progress
					{/if}
				</h3>
				<p class="text-base-content/60 font-light mb-6 max-w-md mx-auto">
					{#if enrollments.length === 0}
						Browse our catalog and enroll in courses to build your skills.
					{:else}
						Pick a new course to continue building your skills.
					{/if}
				</p>
				<a href="/courses" class="btn btn-primary rounded-2xl font-display uppercase tracking-wider">
					Browse Courses
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{#each filteredEnrollments as enrollment}
					<div class="group rounded-3xl bg-base-100 border border-base-200/30 shadow-md hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col">
						<div class="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
							{#if enrollment.course?.thumbnailFileId}
								<img
									src="/api/files/serve/{enrollment.course.thumbnailFileId}"
									alt={enrollment.course.title}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center">
									<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
							{/if}
							{#if enrollment.status === 'completed'}
								<div class="absolute top-4 right-4">
									<span class="badge badge-success uppercase font-mono text-xs tracking-wider">Completed</span>
								</div>
							{/if}
						</div>

						<div class="p-6 flex-1 flex flex-col">
							<h3 class="font-display text-lg font-bold uppercase tracking-tight mb-2 line-clamp-2">
								{enrollment.course?.title ?? 'Untitled Course'}
							</h3>
							{#if enrollment.course?.instructorName}
								<p class="text-xs font-mono text-base-content/50 tracking-wider uppercase mb-4">
									By {enrollment.course.instructorName}
								</p>
							{/if}

							<!-- Progress bar -->
							<div class="mb-4 flex-1">
								<div class="flex items-center justify-between mb-2">
									<span class="text-xs font-mono text-base-content/60 tracking-wider uppercase">Progress</span>
									<span class="text-xs font-mono font-bold">{enrollment.progressPercent ?? 0}%</span>
								</div>
								<div class="w-full h-2 bg-base-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-primary transition-all duration-300"
										style="width: {enrollment.progressPercent ?? 0}%"
									></div>
								</div>
							</div>

							{#if enrollment.lastAccessedAt}
								<p class="text-xs text-base-content/40 font-mono mb-4">
									Last viewed {formatDate(enrollment.lastAccessedAt)}
								</p>
							{/if}

							<a
								href="/learn/course/{enrollment.course?.slug}"
								class="btn btn-primary btn-sm w-full rounded-2xl font-display uppercase tracking-wider"
							>
								{enrollment.status === 'completed' ? 'Review' : (enrollment.progressPercent ?? 0) > 0 ? 'Continue' : 'Start'}
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Container>
</section>
