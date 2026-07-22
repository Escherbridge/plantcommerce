<script lang="ts">
	import { Container } from '$lib/components/layout';
	import type { PageData } from './$types';
	import { Icon } from '$lib/components/icons';

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
					<Icon name="book-open" size={20} class="text-primary/40" />
				</div>
				<div class="font-display text-3xl font-bold lg:text-4xl">{stats?.coursesEnrolled ?? 0}</div>
				<p class="mt-1 text-xs text-base-content/50">Total courses</p>
			</div>

			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
				<div class="mb-2 flex items-start justify-between">
					<span class="text-editorial font-mono text-xs tracking-widest text-secondary"
						>COMPLETED</span
					>
					<Icon name="check-circle" size={20} class="text-success/60" />
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
					<Icon name="zap" size={20} class="text-warning/70" />
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
					<Icon name="bar-chart" size={20} class="text-info/60" />
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
				<Icon name="book-open" size={64} class="mx-auto mb-4 text-base-content/30" />
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
						<div class="relative aspect-video overflow-hidden bg-base-200">
							{#if enrollment.course?.thumbnailFileId}
								<img
									src="/api/files/serve/{enrollment.course.thumbnailFileId}"
									alt={enrollment.course.title}
									class="h-full w-full object-cover"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<Icon name="book-open" size={64} class="text-primary/30" />
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
