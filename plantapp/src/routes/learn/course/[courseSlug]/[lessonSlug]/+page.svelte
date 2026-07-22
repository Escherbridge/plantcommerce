<script lang="ts">
	import ContentBlockRenderer from '$lib/components/lms/content/ContentBlockRenderer.svelte';
	import { trpc } from '$lib/trpc/client';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let marking = $state(false);
	let markError = $state<string | null>(null);

	const course = $derived(data.course);
	const lesson = $derived(data.currentLesson);
	const mod = $derived(data.currentModule);
	const blocks = $derived(data.blocks ?? []);
	const prevLesson = $derived(data.prevLesson);
	const nextLesson = $derived(data.nextLesson);

	async function handleProgress(blockId: string, percent: number) {
		try {
			await trpc.lms.progress.trackProgress.mutate({
				courseId: course.id,
				contentBlockId: blockId,
				status: percent >= 100 ? 'completed' : 'in_progress',
				progressPercent: percent
			});
		} catch (e) {
			console.error('Error tracking progress:', e);
		}
	}

	async function handleMarkComplete() {
		markError = null;
		marking = true;
		try {
			// Mark all blocks in this lesson as completed
			for (const block of blocks) {
				await trpc.lms.progress.trackProgress.mutate({
					courseId: course.id,
					contentBlockId: block.id,
					status: 'completed',
					progressPercent: 100
				});
			}
			await invalidateAll();
			if (nextLesson) {
				await goto(`/learn/course/${course.slug}/${nextLesson.slug}`);
			}
		} catch (e: any) {
			markError = e?.message ?? 'Failed to mark complete.';
		} finally {
			marking = false;
		}
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-10 lg:px-8 lg:py-16">
	<!-- Breadcrumb -->
	<div
		class="mb-6 flex items-center gap-2 font-mono text-xs tracking-wider text-base-content/50 uppercase"
	>
		<a href="/learn/my-courses" class="hover:text-base-content">My Learning</a>
		<span>/</span>
		<a href="/courses/{course.slug}" class="line-clamp-1 hover:text-base-content">{course.title}</a>
		{#if mod}
			<span>/</span>
			<span class="line-clamp-1">{mod.title}</span>
		{/if}
	</div>

	<!-- Lesson Header -->
	<header class="mb-10">
		<h1 class="font-display text-3xl font-bold tracking-tight uppercase lg:text-5xl">
			{lesson.title}
		</h1>
		{#if lesson.description}
			<p class="mt-4 text-lg leading-relaxed font-light text-base-content/70">
				{lesson.description}
			</p>
		{/if}
		{#if lesson.estimatedMinutes}
			<div
				class="mt-4 flex items-center gap-2 font-mono text-xs tracking-wider text-base-content/50 uppercase"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{lesson.estimatedMinutes} min read</span>
			</div>
		{/if}
	</header>

	<!-- Content Blocks -->
	<article class="mb-12">
		{#if blocks.length === 0}
			<div class="rounded-3xl border border-base-200/50 bg-base-100 p-12 text-center">
				<p class="font-light text-base-content/60">This lesson has no content yet.</p>
			</div>
		{:else}
			{#each blocks as block (block.id)}
				<ContentBlockRenderer {block} onProgress={handleProgress} />
			{/each}
		{/if}
	</article>

	{#if markError}
		<div
			class="mb-6 rounded-2xl border border-error/30 bg-error/5 p-4 text-center text-sm text-error"
		>
			{markError}
		</div>
	{/if}

	<!-- Mark complete button -->
	{#if blocks.length > 0}
		<div class="mb-10 text-center">
			<button
				type="button"
				class="font-display btn rounded-2xl tracking-wider uppercase btn-lg btn-primary"
				onclick={handleMarkComplete}
				disabled={marking}
			>
				{#if marking}
					<span class="loading loading-sm loading-spinner"></span>
					Saving
				{:else}
					Mark Complete
					{#if nextLesson}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="ml-2 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
					{/if}
				{/if}
			</button>
		</div>
	{/if}

	<!-- Navigation -->
	<nav class="grid grid-cols-2 gap-4 border-t border-base-200/50 pt-8">
		{#if prevLesson}
			<a
				href="/learn/course/{course.slug}/{prevLesson.slug}"
				class="group rounded-2xl border border-base-200/50 p-5 text-left transition-colors hover:border-primary/30 hover:bg-base-200/20"
			>
				<span
					class="flex items-center gap-2 font-mono text-xs tracking-wider text-base-content/50 uppercase"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3 w-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Previous
				</span>
				<div
					class="font-display mt-1 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary"
				>
					{prevLesson.title}
				</div>
			</a>
		{:else}
			<div></div>
		{/if}

		{#if nextLesson}
			<a
				href="/learn/course/{course.slug}/{nextLesson.slug}"
				class="group rounded-2xl border border-base-200/50 p-5 text-right transition-colors hover:border-primary/30 hover:bg-base-200/20"
			>
				<span
					class="flex items-center justify-end gap-2 font-mono text-xs tracking-wider text-base-content/50 uppercase"
				>
					Next
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3 w-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</span>
				<div
					class="font-display mt-1 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary"
				>
					{nextLesson.title}
				</div>
			</a>
		{/if}
	</nav>
</div>
