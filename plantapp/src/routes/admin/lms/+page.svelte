<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = $derived(
		(data.stats as any) || {
			totalCourses: 0,
			totalEnrollments: 0,
			completionRate: 0,
			totalRevenue: 0,
			activeLearners: 0
		}
	);

	const recentCourses = $derived((data.recentCourses as any[]) || []);

	function formatPct(n: number): string {
		return `${Math.round(n || 0)}%`;
	}

	function formatMoney(n: number | string): string {
		const v = typeof n === 'string' ? parseFloat(n) : n;
		return `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">Learning Management</h1>
				<p class="platform-header__subtitle">Courses, enrollments, and learner progress</p>
			</div>
			<a href="/admin/lms/courses/new" class="platform-action-btn admin-header-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12h14" />
				</svg>
				Create Course
			</a>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="admin-kpi-grid">
		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--courses">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
				</svg>
			</div>
			<span class="platform-stat__label">Total Courses</span>
			<span class="platform-stat__value">{(stats.totalCourses ?? 0).toLocaleString()}</span>
		</div>

		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--enrollments">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
				</svg>
			</div>
			<span class="platform-stat__label">Enrollments</span>
			<span class="platform-stat__value">{(stats.totalEnrollments ?? 0).toLocaleString()}</span>
		</div>

		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--completion">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
					<path d="M22 4L12 14.01l-3-3" />
				</svg>
			</div>
			<span class="platform-stat__label">Completion Rate</span>
			<span class="platform-stat__value">{formatPct(stats.completionRate)}</span>
		</div>

		<div class="platform-stat">
			<div class="admin-stat-icon admin-stat-icon--revenue">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
					<path d="M12 6v12M9 9h4.5a2.5 2.5 0 010 5H9" />
				</svg>
			</div>
			<span class="platform-stat__label">LMS Revenue</span>
			<span class="platform-stat__value" style="color: oklch(var(--su))">{formatMoney(stats.totalRevenue)}</span>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Quick Actions</h2>
		</div>
		<div class="admin-actions-grid">
			<a href="/admin/lms/courses/new" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12h14" />
				</svg>
				Create Course
			</a>
			<a href="/admin/lms/enrollments" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
					<circle cx="9" cy="7" r="4" />
				</svg>
				Manage Enrollments
			</a>
			<a href="/admin/lms/analytics" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 17l6-6 4 4 8-8" />
					<path d="M14 7h7v7" />
				</svg>
				Analytics
			</a>
			<a href="/admin/lms/grading" class="platform-action-btn">
				<svg viewBox="0 0 24 24" class="w-5 h-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 11l3 3L22 4" />
					<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
				</svg>
				Grading Queue
			</a>
		</div>
	</div>

	<!-- Recent Courses -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Recent Courses</h2>
			<a href="/admin/lms/courses" class="admin-view-all-link">View All Courses</a>
		</div>

		{#if recentCourses.length > 0}
			<div class="platform-table-wrapper">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Type</th>
							<th>Status</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{#each recentCourses as course}
							<tr>
								<td class="font-semibold">
									<a href="/admin/lms/courses/{course.id}">{course.title}</a>
								</td>
								<td>{course.courseType}</td>
								<td>
									<span class="platform-badge platform-badge--{course.status === 'published' ? 'success' : 'ghost'}">
										{course.status || 'draft'}
									</span>
								</td>
								<td>{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No Courses Yet</p>
				<p class="platform-empty__text">Create your first course to get started.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

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

	.admin-stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	.admin-stat-icon--courses {
		background: oklch(var(--p) / 0.1);
		color: oklch(var(--p));
	}

	.admin-stat-icon--enrollments {
		background: oklch(var(--s) / 0.1);
		color: oklch(var(--s));
	}

	.admin-stat-icon--completion {
		background: oklch(var(--wa) / 0.1);
		color: oklch(var(--wa));
	}

	.admin-stat-icon--revenue {
		background: oklch(var(--su) / 0.1);
		color: oklch(var(--su));
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

	@media (min-width: 1024px) {
		.admin-actions-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.admin-view-all-link {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--p));
		text-decoration: none;
	}

	.admin-view-all-link:hover {
		color: oklch(var(--p) / 0.7);
	}
</style>
