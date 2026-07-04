<script lang="ts">
	import { Container } from '$lib/components/layout';
	import { trpc } from '$lib/trpc/client';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let enrolling = $state(false);
	let enrollError = $state<string | null>(null);
	let openModuleIds = $state<Set<string>>(new Set());

	const course = $derived(data.course);
	const curriculum = $derived(data.curriculum ?? { modules: [] });

	const totalLessons = $derived(
		(curriculum.modules ?? []).reduce(
			(sum: number, m: any) => sum + (m.lessons?.length ?? 0),
			0
		)
	);

	const formattedPrice = $derived.by(() => {
		if (course.pricingType === 'free' || !course.price || course.price === '0' || course.price === '0.00') {
			return 'Free';
		}
		return `$${course.price}`;
	});

	const instructorDisplayName = $derived.by(() => {
		if (!course.instructor) return 'Aevani Team';
		const first = course.instructor.firstName;
		const last = course.instructor.lastName;
		if (first || last) return [first, last].filter(Boolean).join(' ');
		return course.instructor.username ?? 'Instructor';
	});

	function toggleModule(moduleId: string) {
		const next = new Set(openModuleIds);
		if (next.has(moduleId)) {
			next.delete(moduleId);
		} else {
			next.add(moduleId);
		}
		openModuleIds = next;
	}

	async function handleEnroll() {
		enrollError = null;
		enrolling = true;
		try {
			if (course.pricingType === 'free') {
				await trpc.lms.enrollment.enroll.mutate({ courseId: course.id });
				await goto(`/learn/course/${course.slug}`);
			} else {
				const result: any = await trpc.lms.enrollment.initiatePaid.mutate({ courseId: course.id });
				if (result?.checkoutUrl) {
					window.location.href = result.checkoutUrl;
				} else {
					await goto(`/learn/course/${course.slug}`);
				}
			}
		} catch (e: any) {
			if (e?.data?.code === 'UNAUTHORIZED' || e?.message?.includes('UNAUTHORIZED')) {
				await goto(`/login?redirect=/courses/${course.slug}`);
				return;
			}
			enrollError = e?.message ?? 'Failed to enroll. Please try again.';
		} finally {
			enrolling = false;
		}
	}
</script>

<svelte:head>
	<title>{course.metaTitle || course.title} | Aevani</title>
	<meta name="description" content={course.metaDescription || course.description || ''} />
</svelte:head>

<!-- Hero -->
<section class="bg-primary text-primary-content w-full py-16 lg:py-24">
	<Container>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
			<div class="lg:col-span-2 space-y-6">
				<a href="/courses" class="inline-flex items-center gap-2 text-primary-content/70 hover:text-primary-content font-mono text-sm tracking-wider uppercase">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span>Back to Catalog</span>
				</a>

				<div class="flex flex-wrap items-center gap-3">
					{#if course.difficulty}
						<span class="badge badge-secondary uppercase font-mono tracking-wider">{course.difficulty}</span>
					{/if}
					{#if course.isFeatured}
						<span class="badge badge-outline border-primary-content/50 text-primary-content uppercase font-mono tracking-wider">Featured</span>
					{/if}
					{#if course.courseType}
						<span class="badge badge-outline border-primary-content/50 text-primary-content uppercase font-mono tracking-wider">
							{course.courseType.replace('_', ' ')}
						</span>
					{/if}
				</div>

				<h1 class="font-display text-4xl lg:text-6xl font-bold uppercase tracking-tight">{course.title}</h1>

				{#if course.description}
					<p class="text-lg lg:text-xl text-primary-content/80 font-light leading-relaxed max-w-3xl">
						{course.description}
					</p>
				{/if}

				<div class="flex flex-wrap items-center gap-6 pt-4">
					<div class="flex items-center gap-2 text-primary-content/70">
						<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span class="font-mono text-sm">{instructorDisplayName}</span>
					</div>
					{#if course.enrollmentCount !== undefined}
						<div class="flex items-center gap-2 text-primary-content/70">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<span class="font-mono text-sm">{course.enrollmentCount} enrolled</span>
						</div>
					{/if}
					{#if course.durationEstimate}
						<div class="flex items-center gap-2 text-primary-content/70">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span class="font-mono text-sm">{course.durationEstimate} min</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Enroll Card -->
			<div class="lg:col-span-1">
				<div class="rounded-3xl bg-base-100 text-base-content p-8 shadow-2xl sticky top-8">
					{#if course.thumbnailFileId}
						<div class="aspect-video rounded-2xl overflow-hidden mb-6 bg-base-200">
							<img
								src="/api/files/serve/{course.thumbnailFileId}"
								alt={course.title}
								class="w-full h-full object-cover"
							/>
						</div>
					{/if}

					<div class="text-center mb-6">
						<div class="font-display text-5xl font-bold text-primary">{formattedPrice}</div>
						{#if course.pricingType !== 'free'}
							<p class="text-xs font-mono text-base-content/50 tracking-wider uppercase mt-2">One-time purchase</p>
						{/if}
					</div>

					<button
						type="button"
						class="btn btn-primary btn-lg w-full font-display uppercase tracking-wider rounded-2xl"
						onclick={handleEnroll}
						disabled={enrolling}
					>
						{#if enrolling}
							<span class="loading loading-spinner loading-sm"></span>
							Enrolling...
						{:else if course.pricingType === 'free'}
							Enroll Free
						{:else}
							Buy Course
						{/if}
					</button>

					{#if enrollError}
						<div class="mt-4 text-sm text-error text-center">{enrollError}</div>
					{/if}

					<div class="mt-6 pt-6 border-t border-base-200 space-y-3 text-sm">
						<div class="flex items-center gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-base-content/70">Lifetime access</span>
						</div>
						<div class="flex items-center gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-base-content/70">Certificate of completion</span>
						</div>
						<div class="flex items-center gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-base-content/70">{totalLessons} lessons</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>

<!-- Curriculum -->
<section class="bg-base-100 w-full py-16 lg:py-24">
	<Container>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
			<div class="lg:col-span-2">
				<span class="text-editorial text-secondary font-mono tracking-widest">CURRICULUM</span>
				<h2 class="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tight mt-2 mb-8">
					Course Content
				</h2>

				{#if curriculum.modules && curriculum.modules.length > 0}
					<div class="space-y-4">
						{#each curriculum.modules as mod, idx}
							<div class="rounded-3xl border border-base-200/50 bg-base-100 overflow-hidden">
								<button
									type="button"
									class="w-full p-6 flex items-center justify-between gap-4 hover:bg-base-200/30 transition-colors text-left"
									onclick={() => toggleModule(mod.id)}
								>
									<div class="flex items-start gap-4 flex-1 min-w-0">
										<span class="font-mono text-xs text-base-content/40 tracking-wider mt-1">
											{String(idx + 1).padStart(2, '0')}
										</span>
										<div class="flex-1 min-w-0">
											<h3 class="font-display text-lg font-bold uppercase tracking-tight">{mod.title}</h3>
											{#if mod.description}
												<p class="text-sm text-base-content/60 font-light mt-1 line-clamp-2">{mod.description}</p>
											{/if}
											<p class="text-xs font-mono text-base-content/40 tracking-wider uppercase mt-2">
												{mod.lessons?.length ?? 0} {(mod.lessons?.length ?? 0) === 1 ? 'lesson' : 'lessons'}
											</p>
										</div>
									</div>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="w-5 h-5 text-base-content/40 flex-shrink-0 transition-transform {openModuleIds.has(mod.id) ? 'rotate-180' : ''}"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{#if openModuleIds.has(mod.id) && mod.lessons && mod.lessons.length > 0}
									<div class="border-t border-base-200/50 divide-y divide-base-200/50">
										{#each mod.lessons as lesson}
											<div class="p-5 pl-12 flex items-center gap-3">
												<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
													<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
													<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<span class="flex-1 text-sm">{lesson.title}</span>
												{#if lesson.isPreview}
													<span class="badge badge-ghost badge-sm uppercase font-mono tracking-wider">Preview</span>
												{/if}
												{#if lesson.estimatedMinutes}
													<span class="text-xs font-mono text-base-content/40">{lesson.estimatedMinutes}m</span>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="rounded-3xl border border-base-200/50 bg-base-100 p-12 text-center">
						<p class="text-base-content/60 font-light">Curriculum details will be available after enrollment.</p>
					</div>
				{/if}
			</div>

			<!-- Instructor Card -->
			<div class="lg:col-span-1">
				<span class="text-editorial text-secondary font-mono tracking-widest">INSTRUCTOR</span>
				<h2 class="font-display text-2xl lg:text-3xl font-bold uppercase tracking-tight mt-2 mb-6">
					About the Teacher
				</h2>
				<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
					<div class="flex items-center gap-4 mb-4">
						<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div>
							<h3 class="font-display text-lg font-bold">{instructorDisplayName}</h3>
							<p class="text-xs font-mono text-base-content/50 tracking-wider uppercase">Course Instructor</p>
						</div>
					</div>
					<p class="text-sm text-base-content/60 font-light leading-relaxed">
						Expert in sustainable agriculture with years of hands-on experience sharing practical knowledge with learners worldwide.
					</p>
				</div>
			</div>
		</div>
	</Container>
</section>
