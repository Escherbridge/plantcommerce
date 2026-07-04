<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc/client';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();

	let loading = $state(true);
	let resumeLessonSlug = $state<string | null>(null);

	const course = $derived(data.course);
	const curriculum = $derived(data.curriculum ?? { modules: [] });

	const firstLessonSlug = $derived.by(() => {
		for (const mod of curriculum.modules ?? []) {
			if (mod.lessons && mod.lessons.length > 0) {
				return mod.lessons[0].slug;
			}
		}
		return null;
	});

	onMount(async () => {
		try {
			const resume: any = await trpc.lms.progress.getResumePoint.query({ courseId: course.id });
			if (resume?.lessonId) {
				// Find the slug for this lessonId
				for (const mod of curriculum.modules ?? []) {
					const match = (mod.lessons ?? []).find((l: any) => l.id === resume.lessonId);
					if (match) {
						resumeLessonSlug = match.slug;
						break;
					}
				}
			}
		} catch (e) {
			console.error('Error loading resume point:', e);
		} finally {
			loading = false;
		}
	});

	function handleStart() {
		const target = resumeLessonSlug ?? firstLessonSlug;
		if (target) {
			goto(`/learn/course/${course.slug}/${target}`);
		}
	}
</script>

<div class="max-w-3xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
	<div class="text-center space-y-6">
		<span class="text-editorial text-secondary font-mono tracking-widest">WELCOME</span>
		<h1 class="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight">
			{course.title}
		</h1>
		{#if course.description}
			<p class="text-lg text-base-content/70 font-light leading-relaxed">
				{course.description}
			</p>
		{/if}

		<div class="pt-6">
			{#if loading}
				<button type="button" class="btn btn-primary btn-lg rounded-2xl font-display uppercase tracking-wider" disabled>
					<span class="loading loading-spinner loading-sm"></span>
					Loading
				</button>
			{:else if !firstLessonSlug && !resumeLessonSlug}
				<div class="rounded-3xl border border-base-200/50 bg-base-100 p-8">
					<p class="text-base-content/60 font-light">
						Course content is being prepared. Check back soon.
					</p>
				</div>
			{:else}
				<button
					type="button"
					class="btn btn-primary btn-lg rounded-2xl font-display uppercase tracking-wider"
					onclick={handleStart}
				>
					{resumeLessonSlug ? 'Resume Learning' : 'Start Learning'}
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
</div>
