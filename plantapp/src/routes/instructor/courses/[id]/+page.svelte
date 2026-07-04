<script lang="ts">
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'edit' | 'students' | 'grading'>('edit');

	const courseId = $derived(data.courseId);
	const curriculum = $derived(data.curriculum as any);
	const enrollments = $derived((data.enrollments as any[]) || []);
	const gradingQueue = $derived((data.gradingQueue as any[]) || []);

	const course = $derived(curriculum?.course || null);
	const modules = $derived((curriculum?.modules as any[]) || []);

	// Edit form state
	let title = $state('');
	let description = $state('');
	let initialised = $state(false);
	let saving = $state(false);

	$effect(() => {
		if (course && !initialised) {
			title = course.title || '';
			description = course.description || '';
			initialised = true;
		}
	});

	async function saveCourse() {
		if (saving) return;
		saving = true;
		try {
			await trpc.lms.course.update.mutate({
				id: courseId,
				title,
				description: description || undefined
			});
			await invalidateAll();
		} catch (err) {
			console.error('Save error:', err);
			alert('Failed to save course');
		} finally {
			saving = false;
		}
	}

	// Grading
	let grades = $state<Record<string, number>>({});
	let feedbacks = $state<Record<string, string>>({});
	let gradingBusyId = $state<string | null>(null);

	async function submitGrade(answerId: string) {
		if (gradingBusyId) return;
		const score = grades[answerId];
		const feedback = feedbacks[answerId] || '';

		if (score == null || isNaN(score)) {
			alert('Please enter a score');
			return;
		}

		gradingBusyId = answerId;
		try {
			await trpc.lms.quiz.gradeAnswer.mutate({ answerId, score, feedback });
			delete grades[answerId];
			delete feedbacks[answerId];
			await invalidateAll();
		} catch (err: any) {
			console.error('Grade error:', err);
			alert(err?.message || 'Failed to grade');
		} finally {
			gradingBusyId = null;
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
			default:
				return 'platform-badge platform-badge--ghost';
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">{course?.title || 'Course'}</h1>
				<p class="platform-header__subtitle">
					{course?.slug || courseId}
					{#if course?.status}
						<span class="platform-badge platform-badge--{course.status === 'published' ? 'success' : 'ghost'}">
							{course.status}
						</span>
					{/if}
				</p>
			</div>
			<a href="/instructor" class="btn btn-ghost btn-sm">Back to Dashboard</a>
		</div>
	</div>

	<div class="admin-tabs">
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'edit'}
			onclick={() => (activeTab = 'edit')}
		>
			Edit
		</button>
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'students'}
			onclick={() => (activeTab = 'students')}
		>
			Students ({enrollments.length})
		</button>
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'grading'}
			onclick={() => (activeTab = 'grading')}
		>
			Grading ({gradingQueue.length})
		</button>
	</div>

	{#if activeTab === 'edit'}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Course Details</h2>
			</div>
			<div class="admin-form-grid">
				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Title</span>
					<input type="text" class="input input-bordered" bind:value={title} />
				</label>
				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Description</span>
					<textarea class="textarea textarea-bordered" rows="5" bind:value={description}></textarea>
				</label>
			</div>
			<div class="admin-form-actions">
				<button class="btn btn-primary" disabled={saving} onclick={saveCourse}>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>

		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Curriculum Overview</h2>
				<a href="/admin/lms/courses/{courseId}" class="admin-view-all-link">Manage in Admin</a>
			</div>
			{#if modules.length > 0}
				<ul class="instructor-module-list">
					{#each modules as mod}
						<li class="instructor-module-item">
							<div class="font-semibold">{mod.title}</div>
							<div class="admin-meta-text">
								{mod.lessons?.length ?? 0} lesson{mod.lessons?.length === 1 ? '' : 's'}
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="admin-empty-hint">No modules yet.</p>
			{/if}
		</div>
	{:else if activeTab === 'students'}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Enrolled Students</h2>
			</div>
			{#if enrollments.length > 0}
				<div class="platform-table-wrapper">
					<table class="platform-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>Status</th>
								<th>Progress</th>
								<th>Enrolled</th>
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
									<td>
										{enrollment.progressPct != null ? `${Math.round(enrollment.progressPct)}%` : '—'}
									</td>
									<td>
										{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '—'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="platform-empty">
					<p class="platform-empty__title">No Students</p>
					<p class="platform-empty__text">No learners are enrolled in this course yet.</p>
				</div>
			{/if}
		</div>
	{:else if activeTab === 'grading'}
		{#if gradingQueue.length > 0}
			<div class="admin-grading-list">
				{#each gradingQueue as item}
					<div class="platform-card">
						<div class="admin-grade-header">
							<div>
								<div class="font-semibold">
									{item.user?.firstName || ''} {item.user?.lastName || ''}
								</div>
								<div class="admin-meta-text">
									{item.quiz?.title || 'Quiz'}
								</div>
							</div>
							<span class="platform-badge platform-badge--warning">Pending</span>
						</div>

						<div>
							<div class="admin-grade-label">Question</div>
							<p class="admin-grade-question">{item.question?.prompt || '—'}</p>
						</div>

						<div>
							<div class="admin-grade-label">Response</div>
							<div class="admin-grade-response">{item.response || '—'}</div>
						</div>

						<div class="admin-grade-inputs">
							<label class="admin-field">
								<span class="admin-field__label">Score (out of {item.question?.points ?? 100})</span>
								<input
									type="number"
									min="0"
									max={item.question?.points ?? 100}
									class="input input-bordered"
									bind:value={grades[item.id]}
								/>
							</label>
							<label class="admin-field admin-field--grow">
								<span class="admin-field__label">Feedback</span>
								<textarea
									class="textarea textarea-bordered"
									rows="3"
									bind:value={feedbacks[item.id]}
								></textarea>
							</label>
						</div>

						<div class="admin-grade-actions">
							<button
								class="btn btn-primary"
								disabled={gradingBusyId === item.id}
								onclick={() => submitGrade(item.id)}
							>
								{gradingBusyId === item.id ? 'Submitting...' : 'Submit Grade'}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="platform-empty">
				<p class="platform-empty__title">Nothing to Grade</p>
				<p class="platform-empty__text">All submissions for this course have been graded.</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.admin-header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid oklch(var(--bc) / 0.1);
	}

	.admin-tab {
		padding: 0.625rem 1rem;
		background: transparent;
		border: none;
		color: oklch(var(--bc) / 0.6);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border-bottom: 2px solid transparent;
	}

	.admin-tab--active {
		color: oklch(var(--p));
		border-bottom-color: oklch(var(--p));
	}

	.admin-form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.admin-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.admin-field--full {
		grid-column: 1 / -1;
	}

	.admin-field--grow {
		min-width: 0;
	}

	.admin-field__label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
	}

	.admin-form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.admin-view-all-link {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--p));
		text-decoration: none;
	}

	.instructor-module-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.instructor-module-item {
		padding: 0.625rem 0;
		border-bottom: 1px solid oklch(var(--bc) / 0.08);
	}

	.instructor-module-item:last-child {
		border-bottom: none;
	}

	.admin-meta-text {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
	}

	.admin-empty-hint {
		color: oklch(var(--bc) / 0.6);
		font-size: 0.875rem;
	}

	.admin-grading-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.admin-grade-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid oklch(var(--bc) / 0.08);
		margin-bottom: 0.75rem;
	}

	.admin-grade-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(var(--bc) / 0.6);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.admin-grade-question {
		margin: 0 0 0.75rem 0;
	}

	.admin-grade-response {
		padding: 0.75rem 1rem;
		background: oklch(var(--b2) / 0.5);
		border-radius: 8px;
		font-size: 0.875rem;
		white-space: pre-wrap;
		margin-bottom: 0.75rem;
	}

	.admin-grade-inputs {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	@media (max-width: 640px) {
		.admin-grade-inputs {
			grid-template-columns: 1fr;
		}
	}

	.admin-grade-actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
