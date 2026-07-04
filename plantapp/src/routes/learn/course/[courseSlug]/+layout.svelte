<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	let sidebarOpen = $state(false);

	const course = $derived(data.course);
	const curriculum = $derived(data.curriculum ?? { modules: [] });
	const progress = $derived(data.progress);

	// Build set of completed lesson IDs
	const completedLessonIds = $derived.by(() => {
		const set = new Set<string>();
		if (progress && Array.isArray(progress)) {
			for (const mod of progress) {
				if (Array.isArray(mod.lessons)) {
					for (const lesson of mod.lessons) {
						if (lesson.progressPercent >= 100) {
							set.add(lesson.id);
						}
					}
				}
			}
		}
		return set;
	});

	// Flat list of lessons for total count / progress bar
	const allLessons = $derived.by(() => {
		const flat: any[] = [];
		for (const mod of curriculum.modules ?? []) {
			for (const lesson of mod.lessons ?? []) {
				flat.push({ ...lesson, moduleTitle: mod.title });
			}
		}
		return flat;
	});

	const progressPercent = $derived.by(() => {
		if (allLessons.length === 0) return 0;
		let completed = 0;
		for (const lesson of allLessons) {
			if (completedLessonIds.has(lesson.id)) completed++;
		}
		return Math.round((completed / allLessons.length) * 100);
	});

	// Current lesson from URL (lessonSlug is a child route param)
	const currentLessonSlug = $derived((page.params as Record<string, string | undefined>).lessonSlug);

	const currentLesson = $derived(
		allLessons.find((l: any) => l.slug === currentLessonSlug) ?? null
	);

	const currentModule = $derived.by(() => {
		if (!currentLesson) return null;
		return (curriculum.modules ?? []).find((m: any) =>
			(m.lessons ?? []).some((l: any) => l.slug === currentLessonSlug)
		);
	});

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<svelte:head>
	<title>{currentLesson?.title ? `${currentLesson.title} | ` : ''}{course.title} | Aevani</title>
</svelte:head>

<!-- Progress Bar -->
<div class="sticky top-0 z-40 bg-base-100 border-b border-base-200/50">
	<div class="h-1 bg-base-200">
		<div class="h-full bg-primary transition-all duration-500" style="width: {progressPercent}%"></div>
	</div>
	<div class="px-4 lg:px-8 py-3 flex items-center gap-3">
		<button
			type="button"
			class="btn btn-ghost btn-sm lg:hidden"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			aria-label="Toggle curriculum sidebar"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
		<a href="/learn/my-courses" class="text-xs font-mono text-base-content/50 hover:text-base-content tracking-wider uppercase hidden sm:flex items-center gap-1">
			<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Exit
		</a>
		<div class="flex-1 min-w-0">
			<div class="text-xs font-mono text-base-content/50 tracking-wider uppercase truncate">
				{#if currentModule}{currentModule.title} / {/if}{currentLesson?.title ?? course.title}
			</div>
		</div>
		<div class="text-xs font-mono font-bold">{progressPercent}%</div>
	</div>
</div>

<div class="flex min-h-[calc(100vh-3.5rem)] bg-base-100">
	<!-- Sidebar -->
	<aside
		class="fixed lg:sticky lg:top-14 lg:self-start lg:h-[calc(100vh-3.5rem)] inset-y-0 left-0 z-30 w-80 bg-base-100 border-r border-base-200/50 overflow-y-auto transition-transform lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
	>
		<div class="p-6 border-b border-base-200/50">
			<span class="text-editorial text-secondary font-mono text-xs tracking-widest">COURSE</span>
			<h2 class="font-display text-lg font-bold uppercase tracking-tight mt-1 line-clamp-2">
				{course.title}
			</h2>
		</div>

		<nav class="p-4">
			{#each curriculum.modules ?? [] as mod, idx}
				<div class="mb-6">
					<div class="px-3 py-2 flex items-center gap-3">
						<span class="font-mono text-xs text-base-content/40">{String(idx + 1).padStart(2, '0')}</span>
						<h3 class="font-display text-sm font-bold uppercase tracking-wider flex-1">{mod.title}</h3>
					</div>
					<ul class="space-y-1">
						{#each mod.lessons ?? [] as lesson}
							{@const isActive = lesson.slug === currentLessonSlug}
							{@const isCompleted = completedLessonIds.has(lesson.id)}
							<li>
								<a
									href="/learn/course/{course.slug}/{lesson.slug}"
									onclick={closeSidebar}
									class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors {isActive ? 'bg-primary/10 text-primary font-medium' : 'text-base-content/70 hover:bg-base-200/50 hover:text-base-content'}"
								>
									<span class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
										{#if isCompleted}
											<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
												<circle cx="12" cy="12" r="9" />
											</svg>
										{/if}
									</span>
									<span class="flex-1 line-clamp-2">{lesson.title}</span>
									{#if lesson.estimatedMinutes}
										<span class="text-xs font-mono text-base-content/40">{lesson.estimatedMinutes}m</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</nav>
	</aside>

	<!-- Sidebar backdrop (mobile) -->
	{#if sidebarOpen}
		<button
			type="button"
			class="fixed inset-0 bg-black/40 z-20 lg:hidden"
			onclick={closeSidebar}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Main content -->
	<main class="flex-1 min-w-0">
		{@render children()}
	</main>
</div>
