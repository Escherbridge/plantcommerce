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

<div class="mx-auto max-w-3xl px-4 py-16 lg:px-8 lg:py-24">
	<div class="space-y-6 text-center">
		<span class="text-editorial font-mono tracking-widest text-secondary">WELCOME</span>
		<h1 class="font-display text-4xl font-bold tracking-tight uppercase lg:text-5xl">
			{course.title}
		</h1>
		{#if course.description}
			<p class="text-lg leading-relaxed font-light text-base-content/70">
				{course.description}
			</p>
		{/if}

		<div class="pt-6">
			{#if loading}
				<button
					type="button"
					class="font-display btn rounded-2xl tracking-wider uppercase btn-lg btn-primary"
					disabled
				>
					<span class="loading loading-sm loading-spinner"></span>
					Loading
				</button>
			{:else if !firstLessonSlug && !resumeLessonSlug}
				<div class="rounded-3xl border border-base-200/50 bg-base-100 p-8">
					<p class="font-light text-base-content/60">
						Course content is being prepared. Check back soon.
					</p>
				</div>
			{:else}
				<button
					type="button"
					class="font-display btn rounded-2xl tracking-wider uppercase btn-lg btn-primary"
					onclick={handleStart}
				>
					{resumeLessonSlug ? 'Resume Learning' : 'Start Learning'}
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
				</button>
			{/if}
		</div>
	</div>
</div>
