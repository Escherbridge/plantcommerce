<script lang="ts">
	import { goto } from '$app/navigation';
	import { trpc } from '$lib/trpc/client';

	let title = $state('');
	let slug = $state('');
	let description = $state('');
	let courseType = $state<'self_paced' | 'instructor_led' | 'blended' | 'cohort'>('self_paced');
	let difficulty = $state<'beginner' | 'intermediate' | 'advanced'>('beginner');
	let language = $state('en');
	let pricingType = $state<'free' | 'one_time'>('free');
	let price = $state('');
	let enrollmentType = $state<'open' | 'approval' | 'invite' | 'capacity'>('open');
	let maxEnrollment = $state<number | null>(null);
	let passingScore = $state(70);

	let submitting = $state(false);
	let error = $state<string | null>(null);

	function slugifyFrom(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	}

	function onTitleInput() {
		if (!slug) {
			slug = slugifyFrom(title);
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (submitting) return;
		error = null;

		if (!title.trim()) {
			error = 'Title is required';
			return;
		}
		if (!slug.trim()) {
			error = 'Slug is required';
			return;
		}
		if (pricingType === 'one_time' && !price.trim()) {
			error = 'Price is required for paid courses';
			return;
		}

		submitting = true;
		try {
			const input: any = {
				title: title.trim(),
				slug: slug.trim(),
				description: description.trim() || undefined,
				courseType,
				difficulty,
				language,
				pricingType,
				enrollmentType,
				passingScore
			};
			if (pricingType === 'one_time') {
				input.price = parseFloat(price).toFixed(2);
			}
			if (maxEnrollment) {
				input.maxEnrollment = maxEnrollment;
			}
			const course = await trpc.lms.course.create.mutate(input);
			await goto(`/admin/lms/courses/${(course as any).id}`);
		} catch (err: any) {
			console.error('Create course error:', err);
			error = err?.message || 'Failed to create course';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<h1 class="platform-header__title">New Course</h1>
		<p class="platform-header__subtitle">Fill in the basics, then build the curriculum next</p>
	</div>

	<form onsubmit={handleSubmit} class="admin-form">
		<!-- Basics -->
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Basics</h2>
			</div>
			<div class="admin-form-grid">
				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Title *</span>
					<input
						type="text"
						class="input input-bordered"
						bind:value={title}
						oninput={onTitleInput}
						placeholder="Introduction to Hydroponics"
					/>
				</label>

				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Slug *</span>
					<input
						type="text"
						class="input input-bordered"
						bind:value={slug}
						placeholder="intro-to-hydroponics"
					/>
				</label>

				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Description</span>
					<textarea
						class="textarea textarea-bordered"
						rows="4"
						bind:value={description}
						placeholder="Brief summary of the course..."
					></textarea>
				</label>

				<label class="admin-field">
					<span class="admin-field__label">Course Type</span>
					<select class="select select-bordered" bind:value={courseType}>
						<option value="self_paced">Self-paced</option>
						<option value="instructor_led">Instructor-led</option>
						<option value="blended">Blended</option>
						<option value="cohort">Cohort</option>
					</select>
				</label>

				<label class="admin-field">
					<span class="admin-field__label">Difficulty</span>
					<select class="select select-bordered" bind:value={difficulty}>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
					</select>
				</label>

				<label class="admin-field">
					<span class="admin-field__label">Language</span>
					<input type="text" class="input input-bordered" bind:value={language} />
				</label>
			</div>
		</div>

		<!-- Pricing -->
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Pricing</h2>
			</div>
			<div class="admin-form-grid">
				<label class="admin-field">
					<span class="admin-field__label">Pricing Type</span>
					<select class="select select-bordered" bind:value={pricingType}>
						<option value="free">Free</option>
						<option value="one_time">One-time payment</option>
					</select>
				</label>

				{#if pricingType === 'one_time'}
					<label class="admin-field">
						<span class="admin-field__label">Price (USD)</span>
						<input
							type="number"
							step="0.01"
							min="0"
							class="input input-bordered"
							bind:value={price}
							placeholder="49.99"
						/>
					</label>
				{/if}
			</div>
		</div>

		<!-- Enrollment -->
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Enrollment</h2>
			</div>
			<div class="admin-form-grid">
				<label class="admin-field">
					<span class="admin-field__label">Enrollment Type</span>
					<select class="select select-bordered" bind:value={enrollmentType}>
						<option value="open">Open</option>
						<option value="approval">Approval required</option>
						<option value="invite">Invite only</option>
						<option value="capacity">Capacity-limited</option>
					</select>
				</label>

				<label class="admin-field">
					<span class="admin-field__label">Max Enrollment</span>
					<input
						type="number"
						min="1"
						class="input input-bordered"
						bind:value={maxEnrollment}
						placeholder="Leave blank for unlimited"
					/>
				</label>

				<label class="admin-field">
					<span class="admin-field__label">Passing Score (%)</span>
					<input
						type="number"
						min="0"
						max="100"
						class="input input-bordered"
						bind:value={passingScore}
					/>
				</label>
			</div>
		</div>

		{#if error}
			<div class="admin-error">{error}</div>
		{/if}

		<div class="admin-form-actions">
			<a href="/admin/lms/courses" class="btn btn-ghost">Cancel</a>
			<button type="submit" class="btn btn-primary" disabled={submitting}>
				{submitting ? 'Creating...' : 'Create Course'}
			</button>
		</div>
	</form>
</div>

<style>
	.admin-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.admin-form-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}

	@media (min-width: 640px) {
		.admin-form-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.admin-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.admin-field--full {
		grid-column: 1 / -1;
	}

	.admin-field__label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(var(--bc) / 0.7);
	}

	.admin-form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.admin-error {
		padding: 0.75rem 1rem;
		border: 1px solid oklch(var(--er) / 0.4);
		background: oklch(var(--er) / 0.08);
		color: oklch(var(--er));
		border-radius: 8px;
		font-size: 0.875rem;
	}
</style>
