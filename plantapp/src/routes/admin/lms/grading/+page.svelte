<script lang="ts">
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const queue = $derived((data.queue as any[]) || []);

	let grades = $state<Record<string, number>>({});
	let feedbacks = $state<Record<string, string>>({});
	let busyId = $state<string | null>(null);

	async function submitGrade(answerId: string) {
		if (busyId) return;
		const score = grades[answerId];
		const feedback = feedbacks[answerId] || '';

		if (score == null || isNaN(score)) {
			alert('Please enter a score');
			return;
		}

		busyId = answerId;
		try {
			await trpc.lms.quiz.gradeAnswer.mutate({
				answerId,
				score,
				feedback
			});
			delete grades[answerId];
			delete feedbacks[answerId];
			await invalidateAll();
		} catch (err: any) {
			console.error('Grade error:', err);
			alert(err?.message || 'Failed to grade answer');
		} finally {
			busyId = null;
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">Grading Queue</h1>
		<p class="platform-header__subtitle">Review and grade pending quiz answers</p>
	</div>

	{#if queue.length > 0}
		<div class="admin-grading-list">
			{#each queue as item}
				<div class="platform-card">
					<div class="admin-grade-header">
						<div>
							<div class="admin-grade-learner">
								{item.user?.firstName || ''} {item.user?.lastName || ''}
							</div>
							<div class="admin-meta-text">
								{item.quiz?.title || 'Quiz'} • {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : ''}
							</div>
						</div>
						<span class="platform-badge platform-badge--warning">Pending</span>
					</div>

					<div class="admin-grade-question">
						<div class="admin-grade-label">Question</div>
						<p>{item.question?.prompt || '—'}</p>
					</div>

					<div class="admin-grade-answer">
						<div class="admin-grade-label">Learner Response</div>
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
								placeholder="Optional feedback for the learner..."
								bind:value={feedbacks[item.id]}
							></textarea>
						</label>
					</div>

					<div class="admin-grade-actions">
						<button
							class="btn btn-primary"
							disabled={busyId === item.id}
							onclick={() => submitGrade(item.id)}
						>
							{busyId === item.id ? 'Submitting...' : 'Submit Grade'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="platform-empty">
			<p class="platform-empty__title">Queue Empty</p>
			<p class="platform-empty__text">All learner submissions have been graded.</p>
		</div>
	{/if}
</div>

<style>
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

	.admin-grade-learner {
		font-weight: 600;
	}

	.admin-meta-text {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
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
		margin-bottom: 0.75rem;
	}

	.admin-grade-question p {
		margin: 0;
		font-size: 0.9375rem;
	}

	.admin-grade-answer {
		margin-bottom: 0.75rem;
	}

	.admin-grade-response {
		padding: 0.75rem 1rem;
		background: oklch(var(--b2) / 0.5);
		border-radius: 8px;
		font-size: 0.875rem;
		white-space: pre-wrap;
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

	.admin-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.admin-field--grow {
		min-width: 0;
	}

	.admin-field__label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
	}

	.admin-grade-actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
