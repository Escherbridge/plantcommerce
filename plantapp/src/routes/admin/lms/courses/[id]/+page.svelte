<script lang="ts">
	import type { PageData } from './$types';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let activeTab = $state<'overview' | 'curriculum' | 'quizzes' | 'settings'>('overview');

	const courseId = $derived(data.courseId);
	const curriculum = $derived(data.curriculum as any);
	const modules = $derived((data.modules as any[]) || []);

	const course = $derived(curriculum?.course || null);

	// Edit form state for Overview
	let title = $state('');
	let description = $state('');
	let difficulty = $state('');
	let passingScore = $state(70);
	let initialised = $state(false);
	let savingOverview = $state(false);

	$effect(() => {
		if (course && !initialised) {
			title = course.title || '';
			description = course.description || '';
			difficulty = course.difficulty || 'beginner';
			passingScore = course.passingScore ?? 70;
			initialised = true;
		}
	});

	// New module form
	let newModuleTitle = $state('');
	let newModuleSlug = $state('');
	let creatingModule = $state(false);

	// New lesson (per module)
	let lessonDraftFor = $state<string | null>(null);
	let newLessonTitle = $state('');
	let newLessonSlug = $state('');
	let creatingLesson = $state(false);

	let actionBusy = $state(false);

	async function saveOverview() {
		if (savingOverview) return;
		savingOverview = true;
		try {
			await trpc.lms.course.update.mutate({
				id: courseId,
				title,
				description: description || undefined,
				difficulty: (difficulty || undefined) as any,
				passingScore
			});
			await invalidateAll();
		} catch (err) {
			console.error('Save error:', err);
			alert('Failed to save course');
		} finally {
			savingOverview = false;
		}
	}

	async function publishCourse() {
		if (actionBusy) return;
		actionBusy = true;
		try {
			await trpc.lms.course.publish.mutate({ id: courseId });
			await invalidateAll();
		} catch (err) {
			console.error('Publish error:', err);
			alert('Failed to publish');
		} finally {
			actionBusy = false;
		}
	}

	async function createModule() {
		if (creatingModule) return;
		if (!newModuleTitle.trim() || !newModuleSlug.trim()) {
			alert('Module title and slug are required');
			return;
		}
		creatingModule = true;
		try {
			await trpc.lms.curriculum.createModule.mutate({
				courseId,
				title: newModuleTitle.trim(),
				slug: newModuleSlug.trim()
			});
			newModuleTitle = '';
			newModuleSlug = '';
			await invalidateAll();
		} catch (err) {
			console.error('Create module error:', err);
			alert('Failed to create module');
		} finally {
			creatingModule = false;
		}
	}

	async function deleteModule(moduleId: string, name: string) {
		if (!confirm(`Delete module "${name}" and all its lessons?`)) return;
		try {
			await trpc.lms.curriculum.deleteModule.mutate({ moduleId });
			await invalidateAll();
		} catch (err) {
			console.error('Delete module error:', err);
			alert('Failed to delete module');
		}
	}

	function startLessonDraft(moduleId: string) {
		lessonDraftFor = moduleId;
		newLessonTitle = '';
		newLessonSlug = '';
	}

	async function createLesson(moduleId: string) {
		if (creatingLesson) return;
		if (!newLessonTitle.trim() || !newLessonSlug.trim()) {
			alert('Lesson title and slug are required');
			return;
		}
		creatingLesson = true;
		try {
			await trpc.lms.curriculum.createLesson.mutate({
				moduleId,
				title: newLessonTitle.trim(),
				slug: newLessonSlug.trim(),
				isPreview: false
			});
			lessonDraftFor = null;
			newLessonTitle = '';
			newLessonSlug = '';
			await invalidateAll();
		} catch (err) {
			console.error('Create lesson error:', err);
			alert('Failed to create lesson');
		} finally {
			creatingLesson = false;
		}
	}

	async function deleteLesson(lessonId: string, name: string) {
		if (!confirm(`Delete lesson "${name}"?`)) return;
		try {
			await trpc.lms.curriculum.deleteLesson.mutate({ lessonId });
			await invalidateAll();
		} catch (err) {
			console.error('Delete lesson error:', err);
			alert('Failed to delete lesson');
		}
	}
</script>

<div class="platform-content">
	<div class="platform-header">
		<div class="admin-header-row">
			<div>
				<h1 class="platform-header__title">{course?.title || 'Edit Course'}</h1>
				<p class="platform-header__subtitle">
					{course?.slug || courseId}
					{#if course?.status}
						<span
							class="platform-badge platform-badge--{course.status === 'published'
								? 'success'
								: 'ghost'}"
						>
							{course.status}
						</span>
					{/if}
				</p>
			</div>
			<div class="admin-header-actions">
				<a href="/admin/lms/courses" class="btn btn-ghost btn-sm">Back</a>
				{#if course?.status !== 'published'}
					<button
						class="platform-action-btn admin-header-btn"
						disabled={actionBusy}
						onclick={publishCourse}
					>
						Publish
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="admin-tabs">
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		>
			Overview
		</button>
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'curriculum'}
			onclick={() => (activeTab = 'curriculum')}
		>
			Curriculum
		</button>
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'quizzes'}
			onclick={() => (activeTab = 'quizzes')}
		>
			Quizzes
		</button>
		<button
			class="admin-tab"
			class:admin-tab--active={activeTab === 'settings'}
			onclick={() => (activeTab = 'settings')}
		>
			Settings
		</button>
	</div>

	{#if activeTab === 'overview'}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Course Details</h2>
			</div>
			<div class="admin-form-grid">
				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Title</span>
					<input type="text" class="input-bordered input" bind:value={title} />
				</label>
				<label class="admin-field admin-field--full">
					<span class="admin-field__label">Description</span>
					<textarea class="textarea-bordered textarea" rows="4" bind:value={description}></textarea>
				</label>
				<label class="admin-field">
					<span class="admin-field__label">Difficulty</span>
					<select class="select-bordered select" bind:value={difficulty}>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
					</select>
				</label>
				<label class="admin-field">
					<span class="admin-field__label">Passing Score</span>
					<input
						type="number"
						min="0"
						max="100"
						class="input-bordered input"
						bind:value={passingScore}
					/>
				</label>
			</div>
			<div class="admin-form-actions">
				<button class="btn btn-primary" disabled={savingOverview} onclick={saveOverview}>
					{savingOverview ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>
	{:else if activeTab === 'curriculum'}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Modules</h2>
			</div>

			<!-- Add module form -->
			<div class="admin-inline-form">
				<input
					type="text"
					class="input-bordered admin-inline-input input"
					placeholder="Module title"
					bind:value={newModuleTitle}
				/>
				<input
					type="text"
					class="input-bordered admin-inline-input input"
					placeholder="module-slug"
					bind:value={newModuleSlug}
				/>
				<button class="btn btn-primary" disabled={creatingModule} onclick={createModule}>
					{creatingModule ? 'Adding...' : 'Add Module'}
				</button>
			</div>

			{#if modules.length > 0}
				<div class="admin-module-list">
					{#each modules as mod}
						<div class="admin-module">
							<div class="admin-module__header">
								<div>
									<div class="admin-module__title">{mod.title}</div>
									<div class="admin-meta-text">{mod.slug}</div>
								</div>
								<div class="admin-action-group">
									<button class="btn btn-ghost btn-sm" onclick={() => startLessonDraft(mod.id)}>
										Add Lesson
									</button>
									<button
										class="btn btn-ghost btn-sm"
										onclick={() => deleteModule(mod.id, mod.title)}
									>
										Delete Module
									</button>
								</div>
							</div>

							{#if mod.lessons && mod.lessons.length > 0}
								<ul class="admin-lesson-list">
									{#each mod.lessons as lesson}
										<li class="admin-lesson">
											<div>
												<div class="admin-lesson__title">{lesson.title}</div>
												<div class="admin-meta-text">{lesson.slug}</div>
											</div>
											<button
												class="btn btn-ghost btn-sm"
												onclick={() => deleteLesson(lesson.id, lesson.title)}
											>
												Remove
											</button>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="admin-empty-hint">No lessons yet.</p>
							{/if}

							{#if lessonDraftFor === mod.id}
								<div class="admin-inline-form admin-inline-form--nested">
									<input
										type="text"
										class="input-bordered admin-inline-input input"
										placeholder="Lesson title"
										bind:value={newLessonTitle}
									/>
									<input
										type="text"
										class="input-bordered admin-inline-input input"
										placeholder="lesson-slug"
										bind:value={newLessonSlug}
									/>
									<button
										class="btn btn-sm btn-primary"
										disabled={creatingLesson}
										onclick={() => createLesson(mod.id)}
									>
										Save
									</button>
									<button class="btn btn-ghost btn-sm" onclick={() => (lessonDraftFor = null)}
										>Cancel</button
									>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="platform-empty">
					<p class="platform-empty__title">No Modules Yet</p>
					<p class="platform-empty__text">
						Add your first module to start building the curriculum.
					</p>
				</div>
			{/if}
		</div>
	{:else if activeTab === 'quizzes'}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Quizzes</h2>
			</div>
			<p class="admin-empty-hint">
				Quizzes are attached to lessons or modules. Use the curriculum tab to navigate into a lesson
				and add assessments there. Advanced quiz management UI coming soon.
			</p>
		</div>
	{:else if activeTab === 'settings'}
		<div class="platform-card">
			<div class="platform-card__header">
				<h2 class="platform-card__title">Danger Zone</h2>
			</div>
			<p class="admin-empty-hint">
				Archive or delete this course from the main course list. Additional settings will be added
				here.
			</p>
		</div>
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

	.admin-header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.admin-header-btn {
		width: auto;
		white-space: nowrap;
	}

	.admin-tabs {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid oklch(var(--bc) / 0.1);
		margin-bottom: 1rem;
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
		margin-top: 1rem;
	}

	.admin-inline-form {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
		padding: 0.75rem 0;
	}

	.admin-inline-form--nested {
		padding: 0.5rem 0.75rem;
		margin-top: 0.5rem;
		background: oklch(var(--b2) / 0.5);
		border-radius: 6px;
	}

	.admin-inline-input {
		flex: 1;
		min-width: 150px;
	}

	.admin-module-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.admin-module {
		border: 1px solid oklch(var(--bc) / 0.1);
		border-radius: 8px;
		padding: 0.875rem 1rem;
	}

	.admin-module__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.admin-module__title {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.admin-lesson-list {
		list-style: none;
		padding: 0.5rem 0 0 0;
		margin: 0.5rem 0 0 0;
		border-top: 1px dashed oklch(var(--bc) / 0.1);
	}

	.admin-lesson {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.375rem 0;
	}

	.admin-lesson__title {
		font-size: 0.875rem;
	}

	.admin-meta-text {
		font-size: 0.75rem;
		color: oklch(var(--bc) / 0.5);
		font-family: monospace;
	}

	.admin-empty-hint {
		color: oklch(var(--bc) / 0.6);
		font-size: 0.875rem;
		margin: 0.5rem 0;
	}

	.admin-action-group {
		display: flex;
		gap: 0.5rem;
	}
</style>
