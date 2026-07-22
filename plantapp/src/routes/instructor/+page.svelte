<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const courses = $derived((data.courses as any[]) || []);
	const pendingGrades = $derived((data.pendingGrades as number) || 0);

	const totalStudents = $derived(
		courses.reduce((sum: number, c: any) => sum + (c.enrollmentCount ?? 0), 0)
	);

	const avgCompletion = $derived(() => {
		if (courses.length === 0) return 0;
		const withData = courses.filter((c: any) => c.completionRate != null);
		if (withData.length === 0) return 0;
		const total = withData.reduce((sum: number, c: any) => sum + (c.completionRate ?? 0), 0);
		return Math.round(total / withData.length);
	});
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Instructor Dashboard</h1>
		<p class="platform-header__subtitle">
			Welcome back, {data.user?.firstName || 'Instructor'}
		</p>
	</div>

	<!-- Stats -->
	<div class="admin-kpi-grid">
		<div class="platform-stat">
			<span class="platform-stat__label">My Courses</span>
			<span class="platform-stat__value">{courses.length}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Students</span>
			<span class="platform-stat__value">{totalStudents.toLocaleString()}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Pending Grades</span>
			<span class="platform-stat__value" style="color: oklch(var(--wa))">{pendingGrades}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Avg Completion</span>
			<span class="platform-stat__value">{avgCompletion()}%</span>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Quick Actions</h2>
		</div>
		<div class="admin-actions-grid">
			<a href="/admin/lms/courses/new" class="platform-action-btn">
				<svg
					viewBox="0 0 24 24"
					class="h-5 w-5"
					stroke="currentColor"
					stroke-width="1.5"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 5v14M5 12h14" />
				</svg>
				New Course
			</a>
			<a href="/admin/lms/grading" class="platform-action-btn">
				<svg
					viewBox="0 0 24 24"
					class="h-5 w-5"
					stroke="currentColor"
					stroke-width="1.5"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M9 11l3 3L22 4" />
					<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
				</svg>
				Grading Queue
			</a>
		</div>
	</div>

	<!-- My Courses -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">My Courses</h2>
		</div>

		{#if courses.length > 0}
			<div class="instructor-course-grid">
				{#each courses as course}
					<a href="/instructor/courses/{course.id}" class="instructor-course-card">
						<div class="instructor-course-card__header">
							<h3 class="instructor-course-card__title">{course.title}</h3>
							<span
								class="platform-badge platform-badge--{course.status === 'published'
									? 'success'
									: 'ghost'}"
							>
								{course.status || 'draft'}
							</span>
						</div>
						<p class="instructor-course-card__meta">
							{course.courseType || '—'} • {course.difficulty || '—'}
						</p>
						<div class="instructor-course-card__stats">
							<div>
								<div class="instructor-stat-label">Students</div>
								<div class="instructor-stat-value">{course.enrollmentCount ?? 0}</div>
							</div>
							<div>
								<div class="instructor-stat-label">Completion</div>
								<div class="instructor-stat-value">
									{course.completionRate != null ? `${Math.round(course.completionRate)}%` : '—'}
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No Courses Yet</p>
				<p class="platform-empty__text">You haven't been assigned to any courses yet.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-kpi-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.admin-kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.admin-kpi-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.admin-actions-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.admin-actions-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.instructor-course-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.instructor-course-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.instructor-course-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.instructor-course-card {
		display: block;
		padding: 1rem;
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		transition:
			border-color 150ms ease,
			transform 150ms ease;
	}

	.instructor-course-card:hover {
		border-color: oklch(var(--p) / 0.4);
		transform: translateY(-1px);
	}

	.instructor-course-card__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.375rem;
	}

	.instructor-course-card__title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	.instructor-course-card__meta {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.55);
		margin: 0 0 0.75rem 0;
	}

	.instructor-course-card__stats {
		display: flex;
		gap: 1.25rem;
	}

	.instructor-stat-label {
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(var(--bc) / 0.5);
	}

	.instructor-stat-value {
		font-size: 1rem;
		font-weight: 600;
	}
</style>
