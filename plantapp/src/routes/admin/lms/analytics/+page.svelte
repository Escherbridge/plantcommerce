<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dashboard = $derived((data.dashboard as any) || {});
	const revenue = $derived((data.revenue as any) || {});
	const courses = $derived((data.courses as any[]) || []);

	const today = new Date().toISOString().slice(0, 10);
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

	let startDate = $state(thirtyDaysAgo);
	let endDate = $state(today);

	function formatMoney(n: number | string): string {
		const v = typeof n === 'string' ? parseFloat(n) : n;
		return `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	function formatPct(n: number): string {
		return `${Math.round(n || 0)}%`;
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">LMS Analytics</h1>
		<p class="platform-header__subtitle">Course performance and revenue insights</p>
	</div>

	<!-- Date range -->
	<div class="admin-date-range">
		<label class="admin-field">
			<span class="admin-field__label">Start Date</span>
			<input type="date" class="input input-bordered" bind:value={startDate} />
		</label>
		<label class="admin-field">
			<span class="admin-field__label">End Date</span>
			<input type="date" class="input input-bordered" bind:value={endDate} />
		</label>
	</div>

	<!-- KPI Cards -->
	<div class="admin-kpi-grid">
		<div class="platform-stat">
			<span class="platform-stat__label">Total Revenue</span>
			<span class="platform-stat__value" style="color: oklch(var(--su))">
				{formatMoney(revenue?.totalRevenue ?? dashboard?.totalRevenue ?? 0)}
			</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Enrollments</span>
			<span class="platform-stat__value">{(dashboard?.totalEnrollments ?? 0).toLocaleString()}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Completion Rate</span>
			<span class="platform-stat__value">{formatPct(dashboard?.completionRate ?? 0)}</span>
		</div>
		<div class="platform-stat">
			<span class="platform-stat__label">Active Learners</span>
			<span class="platform-stat__value">{(dashboard?.activeLearners ?? 0).toLocaleString()}</span>
		</div>
	</div>

	<!-- Course performance -->
	<div class="platform-card">
		<div class="platform-card__header">
			<h2 class="platform-card__title">Course Performance</h2>
		</div>

		{#if courses.length > 0}
			<div class="platform-table-wrapper">
				<table class="platform-table">
					<thead>
						<tr>
							<th>Course</th>
							<th>Status</th>
							<th>Enrollments</th>
							<th>Completion</th>
							<th>Revenue</th>
						</tr>
					</thead>
					<tbody>
						{#each courses as course}
							<tr>
								<td class="font-semibold">{course.title}</td>
								<td>
									<span class="platform-badge platform-badge--{course.status === 'published' ? 'success' : 'ghost'}">
										{course.status || 'draft'}
									</span>
								</td>
								<td>{course.enrollmentCount ?? 0}</td>
								<td>{course.completionRate != null ? formatPct(course.completionRate) : '—'}</td>
								<td>{course.revenue ? formatMoney(course.revenue) : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">No Data</p>
				<p class="platform-empty__text">No course performance data available yet.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-date-range {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.admin-field__label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
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
</style>
