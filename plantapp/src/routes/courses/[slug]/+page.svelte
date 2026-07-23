<script lang="ts">
	import { Container } from '$lib/components/layout';
	import { trpc } from '$lib/trpc/client';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Icon } from '$lib/components/icons';

	let { data }: { data: PageData } = $props();

	let enrolling = $state(false);
	let enrollError = $state<string | null>(null);
	let openModuleIds = $state<Set<string>>(new Set());

	const course = $derived(data.course);
	const curriculum = $derived(data.curriculum ?? { modules: [] });

	const totalLessons = $derived(
		(curriculum.modules ?? []).reduce((sum: number, m: any) => sum + (m.lessons?.length ?? 0), 0)
	);

	const formattedPrice = $derived.by(() => {
		if (
			course.pricingType === 'free' ||
			!course.price ||
			course.price === '0' ||
			course.price === '0.00'
		) {
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
<section class="w-full bg-primary py-16 text-primary-content lg:py-24">
	<Container>
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<a
					href="/courses"
					class="inline-flex items-center gap-2 font-mono text-sm tracking-wider text-primary-content/70 uppercase hover:text-primary-content"
				>
					<Icon name="arrow-left" size={16} />
					<span>Back to Catalog</span>
				</a>

				<div class="flex flex-wrap items-center gap-3">
					{#if course.difficulty}
						<span class="badge font-mono tracking-wider uppercase badge-secondary"
							>{course.difficulty}</span
						>
					{/if}
					{#if course.isFeatured}
						<span
							class="badge badge-outline border-primary-content/50 font-mono tracking-wider text-primary-content uppercase"
							>Featured</span
						>
					{/if}
					{#if course.courseType}
						<span
							class="badge badge-outline border-primary-content/50 font-mono tracking-wider text-primary-content uppercase"
						>
							{course.courseType.replace('_', ' ')}
						</span>
					{/if}
				</div>

				<h1 class="font-display text-4xl font-bold tracking-tight uppercase lg:text-6xl">
					{course.title}
				</h1>

				{#if course.description}
					<p
						class="max-w-3xl text-lg leading-relaxed font-light text-primary-content/80 lg:text-xl"
					>
						{course.description}
					</p>
				{/if}

				<div class="flex flex-wrap items-center gap-6 pt-4">
					<div class="flex items-center gap-2 text-primary-content/70">
						<Icon name="user" size={20} />
						<span class="font-mono text-sm">{instructorDisplayName}</span>
					</div>
					{#if course.enrollmentCount !== undefined}
						<div class="flex items-center gap-2 text-primary-content/70">
							<Icon name="users" size={20} />
							<span class="font-mono text-sm">{course.enrollmentCount} enrolled</span>
						</div>
					{/if}
					{#if course.durationEstimate}
						<div class="flex items-center gap-2 text-primary-content/70">
							<Icon name="clock" size={20} />
							<span class="font-mono text-sm">{course.durationEstimate} min</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Enroll Card -->
			<div class="lg:col-span-1">
				<div class="sticky top-8 rounded-3xl bg-base-100 p-8 text-base-content shadow-2xl">
					{#if course.thumbnailFileId}
						<div class="mb-6 aspect-video overflow-hidden rounded-2xl bg-base-200">
							<img
								src="/api/files/serve/{course.thumbnailFileId}"
								alt={course.title}
								class="h-full w-full object-cover"
							/>
						</div>
					{/if}

					<div class="mb-6 text-center">
						<div class="font-display text-5xl font-bold text-primary">{formattedPrice}</div>
						{#if course.pricingType !== 'free'}
							<p class="mt-2 font-mono text-xs tracking-wider text-base-content/50 uppercase">
								One-time purchase
							</p>
						{/if}
					</div>

					<button
						type="button"
						class="font-display btn w-full rounded-2xl tracking-wider uppercase btn-lg btn-primary"
						onclick={handleEnroll}
						disabled={enrolling}
					>
						{#if enrolling}
							<span class="loading loading-sm loading-spinner"></span>
							Enrolling...
						{:else if course.pricingType === 'free'}
							Enroll Free
						{:else}
							Buy Course
						{/if}
					</button>

					{#if enrollError}
						<div class="mt-4 text-center text-sm text-error">{enrollError}</div>
					{/if}

					<div class="mt-6 space-y-3 border-t border-base-200 pt-6 text-sm">
						<div class="flex items-center gap-3">
							<Icon name="check" size={20} class="text-primary" />
							<span class="text-base-content/70">Lifetime access</span>
						</div>
						<div class="flex items-center gap-3">
							<Icon name="check" size={20} class="text-primary" />
							<span class="text-base-content/70">Certificate of completion</span>
						</div>
						<div class="flex items-center gap-3">
							<Icon name="check" size={20} class="text-primary" />
							<span class="text-base-content/70">{totalLessons} lessons</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>

<!-- Curriculum -->
<section class="w-full bg-base-100 py-16 lg:py-24">
	<Container>
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<span class="text-editorial font-mono tracking-widest text-secondary">CURRICULUM</span>
				<h2 class="font-display mt-2 mb-8 text-3xl font-bold tracking-tight uppercase lg:text-4xl">
					Course Content
				</h2>

				{#if curriculum.modules && curriculum.modules.length > 0}
					<div class="space-y-4">
						{#each curriculum.modules as mod, idx}
							<div class="overflow-hidden rounded-3xl border border-base-200/50 bg-base-100">
								<button
									type="button"
									class="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-base-200/30"
									onclick={() => toggleModule(mod.id)}
								>
									<div class="flex min-w-0 flex-1 items-start gap-4">
										<span class="mt-1 font-mono text-xs tracking-wider text-base-content/40">
											{String(idx + 1).padStart(2, '0')}
										</span>
										<div class="min-w-0 flex-1">
											<h3 class="font-display text-lg font-bold tracking-tight uppercase">
												{mod.title}
											</h3>
											{#if mod.description}
												<p class="mt-1 line-clamp-2 text-sm font-light text-base-content/60">
													{mod.description}
												</p>
											{/if}
											<p
												class="mt-2 font-mono text-xs tracking-wider text-base-content/40 uppercase"
											>
												{mod.lessons?.length ?? 0}
												{(mod.lessons?.length ?? 0) === 1 ? 'lesson' : 'lessons'}
											</p>
										</div>
									</div>
									<Icon
										name="chevron-down"
										size={20}
										class="flex-shrink-0 text-base-content/40 transition-transform {openModuleIds.has(
											mod.id
										)
											? 'rotate-180'
											: ''}"
									/>
								</button>
								{#if openModuleIds.has(mod.id) && mod.lessons && mod.lessons.length > 0}
									<div class="divide-y divide-base-200/50 border-t border-base-200/50">
										{#each mod.lessons as lesson}
											<div class="flex items-center gap-3 p-5 pl-12">
												<Icon name="play-circle" size={16} class="text-base-content/40" />
												<span class="flex-1 text-sm">{lesson.title}</span>
												{#if lesson.isPreview}
													<span
														class="badge badge-ghost badge-sm font-mono tracking-wider uppercase"
														>Preview</span
													>
												{/if}
												{#if lesson.estimatedMinutes}
													<span class="font-mono text-xs text-base-content/40"
														>{lesson.estimatedMinutes}m</span
													>
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
						<p class="font-light text-base-content/60">
							Curriculum details will be available after enrollment.
						</p>
					</div>
				{/if}
			</div>

			<!-- Instructor Card -->
			<div class="lg:col-span-1">
				<span class="text-editorial font-mono tracking-widest text-secondary">INSTRUCTOR</span>
				<h2 class="font-display mt-2 mb-6 text-2xl font-bold tracking-tight uppercase lg:text-3xl">
					About the Teacher
				</h2>
				<div class="rounded-3xl border border-base-200/50 bg-base-100 p-6 shadow-sm">
					<div class="mb-4 flex items-center gap-4">
						<div
							class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10"
						>
							<Icon name="user" size={32} class="text-primary" />
						</div>
						<div>
							<h3 class="font-display text-lg font-bold">{instructorDisplayName}</h3>
							<p class="font-mono text-xs tracking-wider text-base-content/50 uppercase">
								Course Instructor
							</p>
						</div>
					</div>
					<p class="text-sm leading-relaxed font-light text-base-content/60">
						Expert in sustainable agriculture with years of hands-on experience sharing practical
						knowledge with learners worldwide.
					</p>
				</div>
			</div>
		</div>
	</Container>
</section>
