<script lang="ts">
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const courses = $derived((data.courses as any[]) || []);

	let selectedCourseId = $state<string>((data.selectedCourseId as string) || '');
	let statusFilter = $state<string>('all');
	let enrollments = $state<any[]>((data.enrollments as any[]) || []);
	let loading = $state(false);
	let busyId = $state<string | null>(null);

	async function refreshEnrollments(courseId: string) {
		if (!courseId) {
			enrollments = [];
			return;
		}
		loading = true;
		try {
			const input: any = { courseId, limit: 100 };
			if (statusFilter !== 'all') input.status = statusFilter;
			const result = await trpc.lms.enrollment.courseEnrollments.query(input);
			enrollments = (result as any[]) || [];
		} catch (err) {
			console.error('Load enrollments error:', err);
			enrollments = [];
		} finally {
			loading = false;
		}
	}

	async function onCourseChange() {
		await refreshEnrollments(selectedCourseId);
	}

	async function onStatusChange() {
		await refreshEnrollments(selectedCourseId);
	}

	async function approveEnrollment(enrollmentId: string) {
		if (busyId) return;
		busyId = enrollmentId;
		try {
			await trpc.lms.enrollment.approve.mutate({ enrollmentId });
			await refreshEnrollments(selectedCourseId);
		} catch (err) {
			console.error('Approve error:', err);
			alert('Failed to approve');
		} finally {
			busyId = null;
		}
	}

	async function rejectEnrollment(enrollmentId: string) {
		if (busyId) return;
		if (!confirm('Reject this enrollment request?')) return;
		busyId = enrollmentId;
		try {
			await trpc.lms.enrollment.reject.mutate({ enrollmentId });
			await refreshEnrollments(selectedCourseId);
		} catch (err) {
			console.error('Reject error:', err);
			alert('Failed to reject');
		} finally {
			busyId = null;
		}
	}

	async function suspendEnrollment(enrollmentId: string) {
		if (busyId) return;
		if (!confirm('Suspend this enrollment?')) return;
		busyId = enrollmentId;
		try {
			await trpc.lms.enrollment.suspend.mutate({ enrollmentId });
			await refreshEnrollments(selectedCourseId);
		} catch (err) {
			console.error('Suspend error:', err);
			alert('Failed to suspend');
		} finally {
			busyId = null;
		}
	}

	function getStatusBadgeClass(status: string): string {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'platform-badge platform-badge--success';
			case 'completed':
				return 'platform-badge platform-badge--primary';
			case 'suspended':
				return 'platform-badge platform-badge--warning';
			case 'expired':
				return 'platform-badge platform-badge--error';
			default:
				return 'platform-badge platform-badge--ghost';
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Enrollments</h1>
		<p class="platform-header__subtitle">Review and manage learner enrollments</p>
	</div>

	<div class="admin-filters">
		<select class="admin-filter-select" bind:value={selectedCourseId} onchange={onCourseChange}>
			<option value="">Select a course</option>
			{#each courses as course}
				<option value={course.id}>{course.title}</option>
			{/each}
		</select>
		<select class="admin-filter-select" bind:value={statusFilter} onchange={onStatusChange}>
			<option value="all">All Status</option>
			<option value="active">Active</option>
			<option value="completed">Completed</option>
			<option value="suspended">Suspended</option>
			<option value="expired">Expired</option>
		</select>
	</div>

	{#if loading}
		<div class="platform-empty">
			<p class="platform-empty__text">Loading enrollments...</p>
		</div>
	{:else if enrollments.length > 0}
		<div class="platform-table-wrapper">
			<table class="platform-table">
				<thead>
					<tr>
						<th>Learner</th>
						<th>Email</th>
						<th>Status</th>
						<th>Enrolled</th>
						<th>Progress</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each enrollments as enrollment}
						<tr>
							<td class="font-semibold">
								{enrollment.user?.firstName || ''} {enrollment.user?.lastName || ''}
							</td>
							<td>{enrollment.user?.email || '—'}</td>
							<td>
								<span class={getStatusBadgeClass(enrollment.status)}>{enrollment.status}</span>
							</td>
							<td>{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '—'}</td>
							<td>{enrollment.progressPct != null ? `${Math.round(enrollment.progressPct)}%` : '—'}</td>
							<td>
								<div class="admin-action-group">
									{#if enrollment.status === 'pending'}
										<button
											class="platform-action-btn admin-table-btn"
											disabled={busyId === enrollment.id}
											onclick={() => approveEnrollment(enrollment.id)}
										>
											Approve
										</button>
										<button
											class="btn btn-ghost btn-sm"
											disabled={busyId === enrollment.id}
											onclick={() => rejectEnrollment(enrollment.id)}
										>
											Reject
										</button>
									{:else if enrollment.status === 'active'}
										<button
											class="btn btn-ghost btn-sm"
											disabled={busyId === enrollment.id}
											onclick={() => suspendEnrollment(enrollment.id)}
										>
											Suspend
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">No Enrollments</p>
			<p class="platform-empty__text">
				{selectedCourseId ? 'No learners match the current filters.' : 'Select a course to view its enrollments.'}
			</p>
		</div>
	{/if}
</div>

<style>
	.admin-filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.admin-filter-select {
		flex: 1;
		min-width: 200px;
		padding: 0.625rem 2rem 0.625rem 1rem;
		border: 1.5px solid var(--input-border);
		border-radius: var(--input-radius, 10px);
		background: oklch(var(--b1));
		color: oklch(var(--bc));
		font-size: 0.875rem;
	}

	.admin-action-group {
		display: flex;
		gap: 0.5rem;
	}

	.admin-table-btn {
		width: auto;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
	}
</style>
