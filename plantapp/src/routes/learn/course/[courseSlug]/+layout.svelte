<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import { Icon } from '$lib/components/icons';

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
	const currentLessonSlug = $derived(
		(page.params as Record<string, string | undefined>).lessonSlug
	);

	const currentLesson = $derived(allLessons.find((l: any) => l.slug === currentLessonSlug) ?? null);

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
<div class="sticky top-0 z-40 border-b border-base-200/50 bg-base-100">
	<div class="h-1 bg-base-200">
		<div
			class="h-full bg-primary transition-all duration-500"
			style="width: {progressPercent}%"
		></div>
	</div>
	<div class="flex items-center gap-3 px-4 py-3 lg:px-8">
		<button
			type="button"
			class="btn btn-ghost btn-sm lg:hidden"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			aria-label="Toggle curriculum sidebar"
		>
			<Icon name="menu" size={20} />
		</button>
		<a
			href="/learn/my-courses"
			class="hidden items-center gap-1 font-mono text-xs tracking-wider text-base-content/50 uppercase hover:text-base-content sm:flex"
		>
			<Icon name="arrow-left" size={12} />
			Exit
		</a>
		<div class="min-w-0 flex-1">
			<div class="truncate font-mono text-xs tracking-wider text-base-content/50 uppercase">
				{#if currentModule}{currentModule.title} /
				{/if}{currentLesson?.title ?? course.title}
			</div>
		</div>
		<div class="font-mono text-xs font-bold">{progressPercent}%</div>
	</div>
</div>

<div class="flex min-h-[calc(100vh-3.5rem)] bg-base-100">
	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-30 w-80 overflow-y-auto border-r border-base-200/50 bg-base-100 transition-transform lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:self-start {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full lg:translate-x-0'}"
	>
		<div class="border-b border-base-200/50 p-6">
			<span class="text-editorial font-mono text-xs tracking-widest text-secondary">COURSE</span>
			<h2 class="font-display mt-1 line-clamp-2 text-lg font-bold tracking-tight uppercase">
				{course.title}
			</h2>
		</div>

		<nav class="p-4">
			{#each curriculum.modules ?? [] as mod, idx}
				<div class="mb-6">
					<div class="flex items-center gap-3 px-3 py-2">
						<span class="font-mono text-xs text-base-content/40"
							>{String(idx + 1).padStart(2, '0')}</span
						>
						<h3 class="font-display flex-1 text-sm font-bold tracking-wider uppercase">
							{mod.title}
						</h3>
					</div>
					<ul class="space-y-1">
						{#each mod.lessons ?? [] as lesson}
							{@const isActive = lesson.slug === currentLessonSlug}
							{@const isCompleted = completedLessonIds.has(lesson.id)}
							<li>
								<a
									href="/learn/course/{course.slug}/{lesson.slug}"
									onclick={closeSidebar}
									class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors {isActive
										? 'bg-primary/10 font-medium text-primary'
										: 'text-base-content/70 hover:bg-base-200/50 hover:text-base-content'}"
								>
									<span class="flex h-5 w-5 flex-shrink-0 items-center justify-center">
										{#if isCompleted}
											<Icon name="check-circle" size={20} class="text-success" />
										{:else}
											<Icon name="circle" size={16} class="text-base-content/40" />
										{/if}
									</span>
									<span class="line-clamp-2 flex-1">{lesson.title}</span>
									{#if lesson.estimatedMinutes}
										<span class="font-mono text-xs text-base-content/40"
											>{lesson.estimatedMinutes}m</span
										>
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
			class="fixed inset-0 z-20 bg-black/40 lg:hidden"
			onclick={closeSidebar}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Main content -->
	<main class="min-w-0 flex-1">
		{@render children()}
	</main>
</div>
